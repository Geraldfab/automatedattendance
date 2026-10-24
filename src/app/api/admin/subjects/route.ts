import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const subjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  description: z.string().optional(),
  units: z.number().min(1).max(6).default(3),
});

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: { select: { schedules: true, enrollments: true, sessions: true } },
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = subjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation error" }, { status: 400 });
    }

    const { code, name, description, units } = result.data;
    const existing = await prisma.subject.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: `Subject code ${code} already exists.` }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        units,
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SUBJECT_CREATED",
      entityType: "Subject",
      entityId: subject.id,
      details: { code: subject.code, name: subject.name },
    });

    return NextResponse.json({ success: true, subject });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("id");
    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Delete schedules, enrollments, sessions and subject
    await prisma.classSchedule.deleteMany({ where: { subjectId } });
    await prisma.classEnrollment.deleteMany({ where: { subjectId } });
    const sessions = await prisma.attendanceSession.findMany({ where: { subjectId } });
    for (const s of sessions) {
      await prisma.attendanceRecord.deleteMany({ where: { sessionId: s.id } });
    }
    await prisma.attendanceSession.deleteMany({ where: { subjectId } });
    await prisma.subject.delete({ where: { id: subjectId } });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SUBJECT_DELETED",
      entityType: "Subject",
      entityId: subjectId,
      details: { code: subject.code, name: subject.name },
    });

    return NextResponse.json({ success: true, message: "Subject removed from curriculum." });
  } catch (error: any) {
    console.error("Delete subject error:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
