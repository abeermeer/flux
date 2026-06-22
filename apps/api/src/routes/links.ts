import { FastifyInstance } from "fastify";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { generateShortCode } from "../lib/nanoid.js";
import { checkURL, checkWebRisk } from "../lib/abuse.js";
import { logAudit } from "../lib/audit.js";

const CACHE_TTL = 86_400;
const REDIRECT_DOMAIN = process.env.REDIRECT_DOMAIN ?? "localhost:3001";

export async function linkRoutes(app: FastifyInstance) {
  // List links
  app.get("/api/links", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };

    const links = await prisma.link.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        shortCode: true,
        destination: true,
        isActive: true,
        clickCount: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return reply.send(links);
  });

  // Get link stats
  app.get("/api/links/:id/stats", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    const [clicks, topReferrers, topCountries] = await Promise.all([
      prisma.click.count({ where: { linkId: id } }),
      prisma.click.groupBy({
        by: ["referer"],
        where: { linkId: id, referer: { not: null } },
        _count: true,
        orderBy: { _count: { referer: "desc" } },
        take: 10,
      }),
      prisma.click.groupBy({
        by: ["country"],
        where: { linkId: id, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
    ]);

    return reply.send({ totalClicks: clicks, topReferrers, topCountries });
  });

  // Update link
  const updateSchema = z.object({
    destination: z.string().url().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(4).max(128).nullable().optional(),
    rules: z.string().nullable().optional(),
  });

  app.patch("/api/links/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const { id } = req.params as { id: string };
    const data = updateSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });

    const updateData: any = {};

    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.rules !== undefined) updateData.rules = data.rules;
    if (data.password !== undefined) {
      updateData.password = data.password ? await bcrypt.hash(data.password, 12) : null;
    }

    await prisma.link.update({ where: { id }, data: updateData });

    // Invalidate cache
    const link = await prisma.link.findUnique({ where: { id }, select: { shortCode: true } });
    if (link) await redis.del(`link:${link.shortCode}`);

    if (workspace) {
      logAudit({
        action: "update", entity: "link", entityId: id,
        actorId: userId, workspaceId: workspace.id,
        metadata: { changes: Object.keys(updateData) },
      });
    }

    return reply.send({ updated: true });
  });

  // QR code
  app.get("/api/links/:shortCode/qr", async (req, reply) => {
    const { shortCode } = req.params as { shortCode: string };
    const url = `https://${REDIRECT_DOMAIN}/${shortCode}`;

    const qr = await QRCode.toString(url, {
      type: "svg",
      margin: 1,
      color: { dark: "#000", light: "#fff" },
    });

    reply.header("Content-Type", "image/svg+xml");
    return reply.send(qr);
  });

  // Bulk create
  const bulkSchema = z.object({
    links: z.array(z.object({
      url: z.string().url(),
      slug: z.string().max(64).optional(),
    })).min(1).max(1000),
  });

  app.post("/api/links/bulk", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = bulkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { id: userId } = req.user as { id: string };
    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) {
      return reply.status(500).send({ error: "No workspace" });
    }

    const results: { url: string; shortCode: string; slug?: string; error?: string }[] = [];

    for (const item of parsed.data.links) {
      const localCheck = checkURL(item.url);
      if (!localCheck.safe) {
        results.push({ ...item, shortCode: "", error: localCheck.reason });
        continue;
      }

      const shortCode = item.slug ?? generateShortCode();

      try {
        const link = await prisma.link.create({
          data: {
            shortCode,
            destination: item.url,
            workspaceId: workspace.id,
            createdById: userId,
          },
        });

        await redis.set(`link:${shortCode}`, JSON.stringify({
          id: link.id, destination: link.destination,
          expiresAt: null, maxClicks: null, clickCount: 0,
        }), "EX", CACHE_TTL);

        results.push({ url: item.url, shortCode, slug: item.slug });
      } catch (err: any) {
        results.push({ url: item.url, shortCode: "", slug: item.slug, error: err.message });
      }
    }

    return reply.status(201).send({ created: results.length, results });
  });
}
