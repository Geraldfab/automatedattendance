import { NextResponse } from "next/server";
import { removeAuthCookie, getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: user.id,
    });
  }
  await removeAuthCookie();
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
