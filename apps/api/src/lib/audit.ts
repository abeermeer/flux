import { prisma } from "./db.js";

export async function logAudit(params: {
  action: "create" | "update" | "delete";
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  actorId?: string | null;
  workspaceId: string;
}) {
  await prisma.auditLog.create({
    data: {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      actorId: params.actorId,
      workspaceId: params.workspaceId,
    },
  });
}

export async function queryAuditLogs(workspaceId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, email: true, name: true } },
    },
  });
}
