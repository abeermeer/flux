import { FastifyInstance } from "fastify";
import { prisma } from "../lib/db.js";
import { queryAuditLogs } from "../lib/audit.js";

export async function auditRoutes(app: FastifyInstance) {
  app.get("/api/audit-logs", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };

    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
    });
    if (!workspace) return reply.send([]);

    const logs = await queryAuditLogs(workspace.id);
    return reply.send(logs);
  });
}
