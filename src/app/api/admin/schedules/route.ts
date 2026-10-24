import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const scheduleSchema = z.object({
  subjectId: z.string().min(1),
  sectionId: z.string().min(1),
  facultyId: z.string().min(1),
  termId: z.string().min(1),
  dayOfWeek: z.string().min(3),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  room: z.string().min(1),
});

export async function GET() {
  try {
    const schedules = await prisma.classSchedule.findMany({
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
        term: true,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json({ schedules });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = scheduleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation error" }, { status: 400 });
    }

    const schedule = await prisma.classSchedule.create({
      data: result.data,
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SCHEDULE_CREATED",
      entityType: "ClassSchedule",
      entityId: schedule.id,
      details: {
        subject: schedule.subject.code,
        section: schedule.section.name,
        room: schedule.room,
        day: schedule.dayOfWeek,
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("id");
    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { subject: true, section: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    await prisma.classSchedule.delete({ where: { id: scheduleId } });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SCHEDULE_DELETED",
      entityType: "ClassSchedule",
      entityId: scheduleId,
      details: {
        subject: schedule.subject.code,
        section: schedule.section.name,
        dayOfWeek: schedule.dayOfWeek,
      },
    });

    return NextResponse.json({ success: true, message: "Class schedule removed successfully." });
  } catch (error: any) {
    console.error("Delete schedule error:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
