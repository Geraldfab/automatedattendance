import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const settingsSchema = z.object({
  schoolName: z.string().min(2),
  departmentName: z.string().min(2),
  defaultGracePeriodMinutes: z.number().min(1).max(60),
  defaultLateCutoffMinutes: z.number().min(5).max(180),
  minimumAttendanceThreshold: z.number().min(50).max(100),
  timeZone: z.string(),
  qrRotationIntervalSeconds: z.number().min(5).max(120),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({ where: { id: "tcci-settings" } });
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "tcci-settings",
          schoolName: "Torres Capitol College Inc.",
          departmentName: "Bachelor of Science in Information Technology",
          defaultGracePeriodMinutes: 15,
          defaultLateCutoffMinutes: 45,
          minimumAttendanceThreshold: 80.0,
          timeZone: "Asia/Manila",
          qrRotationIntervalSeconds: 20,
        },
      });
    }
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = settingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const updated = await prisma.systemSetting.upsert({
      where: { id: "tcci-settings" },
      update: result.data,
      create: { id: "tcci-settings", ...result.data },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SETTINGS_UPDATED",
      entityType: "SystemSetting",
      entityId: "tcci-settings",
      details: result.data,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
