import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";

const brandingSchema = z.object({
  logo: z.string().url().nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  favicon: z.string().url().nullable().optional(),
  appDomain: z.string().optional(),
});

export async function brandingRoutes(app: FastifyInstance) {
  app.get("/api/branding", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      select: { branding: true },
    });

    const branding = workspace?.branding ? JSON.parse(workspace.branding) : null;
    return reply.send(branding ?? {});
  });

  app.put("/api/branding", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const data = brandingSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    const existing = workspace.branding ? JSON.parse(workspace.branding) : {};
    const merged = { ...existing, ...data, logo: data.logo ?? existing.logo ?? null };

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { branding: JSON.stringify(merged) },
    });

    return reply.send(merged);
  });
}
