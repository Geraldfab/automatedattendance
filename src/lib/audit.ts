import prisma from "./prisma";

interface LogParams {
  actorUserId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export async function createAuditLog({
  actorUserId,
  actorName,
  actorRole,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: LogParams) {
  try {
    const detailString = typeof details === "object" ? JSON.stringify(details) : details;
    await prisma.auditLog.create({
      data: {
        actorUserId: actorUserId || null,
        actorName,
        actorRole,
        action,
        entityType,
        entityId: entityId || null,
        details: detailString || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
