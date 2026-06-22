import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/db.js";

export async function workspaceRoutes(app: FastifyInstance) {
  // Get current workspace
  app.get("/api/workspace", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };

    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: userId },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });

    if (!workspace) return reply.status(404).send({ error: "No workspace" });
    return reply.send(workspace);
  });

  // Invite member
  const inviteSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "editor", "viewer"]).default("editor"),
  });

  app.post("/api/workspace/members", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const { email, role } = inviteSchema.parse(req.body);

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (!invitedUser) return reply.status(404).send({ error: "User not found" });

    const existing = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: invitedUser.id, workspaceId: workspace.id } },
    });
    if (existing) return reply.status(409).send({ error: "Already a member" });

    await prisma.workspaceMember.create({
      data: { userId: invitedUser.id, workspaceId: workspace.id, role },
    });

    return reply.status(201).send({ invited: email, role });
  });

  // Remove member
  app.delete("/api/workspace/members/:userId", { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id: userId } = req.user as { id: string };
    const memberId = (req.params as { userId: string }).userId;

    const workspace = await prisma.workspace.findFirst({ where: { ownerId: userId } });
    if (!workspace) return reply.status(404).send({ error: "No workspace" });

    await prisma.workspaceMember.delete({
      where: { userId_workspaceId: { userId: memberId, workspaceId: workspace.id } },
    });

    return reply.status(204).send();
  });
}
