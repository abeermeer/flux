import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { generateShortCode } from "../lib/nanoid.js";
import { checkURL, checkWebRisk } from "../lib/abuse.js";
import { logAudit } from "../lib/audit.js";

const createLinkSchema = z.object({
  url: z.string().url(),
  slug: z.string().max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  domain: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  maxClicks: z.number().int().positive().optional(),
  password: z.string().min(4).max(128).optional(),
});

const CACHE_TTL = 86_400;

export async function createRoutes(app: FastifyInstance) {
  app.post("/api/links", { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = createLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const { url, slug, expiresAt, maxClicks, password } = parsed.data;
    const { id: userId } = req.user as { id: string };

    // Abuse check
    const localCheck = checkURL(url);
    if (!localCheck.safe) {
      return reply.status(422).send({ error: localCheck.reason });
    }

    const webRiskCheck = await checkWebRisk(url);
    if (!webRiskCheck.safe) {
      return reply.status(422).send({ error: webRiskCheck.reason });
    }

    // Get user's workspace
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });

    if (!workspace) {
      return reply.status(500).send({ error: "No workspace found" });
    }

    const shortCode = slug ?? generateShortCode();

    const link = await prisma.link.create({
      data: {
        shortCode,
        destination: url,
        workspaceId: workspace.id,
        createdById: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxClicks: maxClicks ?? null,
        password: password ?? null,
      },
    });

    const cached = {
      id: link.id,
      destination: link.destination,
      expiresAt: link.expiresAt?.toISOString() ?? null,
      maxClicks: link.maxClicks,
      clickCount: 0,
    };
    await redis.set(`link:${shortCode}`, JSON.stringify(cached), "EX", CACHE_TTL);

    logAudit({
      action: "create", entity: "link", entityId: link.id,
      actorId: userId, workspaceId: workspace.id,
      metadata: { shortCode: link.shortCode, destination: url },
    });

    return reply.status(201).send({
      shortCode: link.shortCode,
      shortUrl: `http://localhost:3001/${link.shortCode}`,
      destination: link.destination,
    });
  });
}
