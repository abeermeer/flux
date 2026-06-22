import { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { clickQueue } from "../lib/queue.js";
import { parseUA } from "../lib/ua.js";
import { mergeParams } from "../lib/url.js";
import { evaluateRules } from "../lib/rules.js";

const CACHE_TTL = 86_400;

type CachedLink = {
  id: string;
  destination: string;
  rules: string | null;
  expiresAt: string | null;
  maxClicks: number | null;
  clickCount: number;
};

export async function redirectRoutes(app: FastifyInstance) {
  app.get<{ Querystring: Record<string, string> }>("/:code", async (req, reply) => {
    const { code } = req.params as { code: string };
    const queryParams = req.query || {};

    // Cache-first
    const cachedRaw = await redis.get(`link:${code}`);
    let link: CachedLink | null = null;

    if (cachedRaw) {
      link = JSON.parse(cachedRaw) as CachedLink;
    } else {
      const dbLink = await prisma.link.findUnique({
        where: { shortCode: code, isActive: true },
        select: { id: true, destination: true, rules: true, expiresAt: true, maxClicks: true, clickCount: true },
      });

      if (!dbLink) {
        return reply.status(404).send({ error: "Link not found" });
      }

      link = {
        id: dbLink.id,
        destination: dbLink.destination,
        rules: dbLink.rules,
        expiresAt: dbLink.expiresAt?.toISOString() ?? null,
        maxClicks: dbLink.maxClicks,
        clickCount: dbLink.clickCount,
      };

      await redis.set(`link:${code}`, JSON.stringify(link), "EX", CACHE_TTL);
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return reply.status(410).send({ error: "Link has expired" });
    }

    if (link.maxClicks && link.clickCount >= link.maxClicks) {
      return reply.status(410).send({ error: "Link has reached max clicks" });
    }

    // Evaluate A/B + geo/device rules
    const ua = parseUA(req.headers["user-agent"] ?? null);
    let destination = link.destination;

    if (link.rules) {
      const ruleResult = evaluateRules(link.rules, {
        country: null, // populated by GeoIP in prod
        device: ua.device,
      });
      if (ruleResult) destination = ruleResult;
    }

    // Enqueue click async
    clickQueue.add(`click:${code}`, {
      linkId: link.id,
      shortCode: code,
      ip: req.ip ?? null,
      userAgent: req.headers["user-agent"] ?? null,
      referer: req.headers["referer"] ?? null,
      country: null,
      city: null,
      device: ua.device,
      browser: ua.browser,
      os: ua.os,
      bot: ua.bot,
    }).catch((err) => {
      console.error("Failed to enqueue click:", err);
    });

    const finalUrl = mergeParams(destination, queryParams);
    return reply.redirect(301, finalUrl);
  });
}
