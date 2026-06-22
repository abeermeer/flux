import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";

export async function webhookRoutes(app: FastifyInstance) {
  // List webhooks
  app.get("/api/webhooks", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.send([]);

    const webhooks = await prisma.webhook.findMany({ where: { workspaceId: workspace.id } });
    return reply.send(webhooks);
  });

  // Create webhook
  const createSchema = z.object({
    url: z.string().url(),
    events: z.string().default("click"),
  });

  app.post("/api/webhooks", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const { url, events } = createSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    const webhook = await prisma.webhook.create({
      data: { url, events, workspaceId: workspace.id },
    });

    return reply.status(201).send(webhook);
  });

  // Delete webhook
  app.delete("/api/webhooks/:id", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.webhook.delete({ where: { id } });
    return reply.status(204).send();
  });
}
