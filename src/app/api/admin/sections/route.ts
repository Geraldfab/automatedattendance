import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sectionSchema = z.object({
  name: z.string().min(2),
  program: z.string().default("BSIT"),
  yearLevel: z.number().min(1).max(5),
  termId: z.string().optional(),
});

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        term: true,
        _count: { select: { students: true, schedules: true } },
      },
      orderBy: [{ yearLevel: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ sections });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = sectionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation error" }, { status: 400 });
    }

    const { name, program, yearLevel, termId } = result.data;
    const existing = await prisma.section.findUnique({
      where: { name_yearLevel: { name, yearLevel } },
    });
    if (existing) {
      return NextResponse.json({ error: `Section ${name} already exists for Year ${yearLevel}` }, { status: 400 });
    }

    const section = await prisma.section.create({
      data: { name, program, yearLevel, termId },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SECTION_CREATED",
      entityType: "Section",
      entityId: section.id,
      details: { name, yearLevel },
    });

    return NextResponse.json({ success: true, section });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("id");
    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Unassign students from this section
    await prisma.studentProfile.updateMany({
      where: { sectionId },
      data: { sectionId: null },
    });

    // Delete schedules, enrollments, sessions and section
    await prisma.classSchedule.deleteMany({ where: { sectionId } });
    await prisma.classEnrollment.deleteMany({ where: { sectionId } });
    const sessions = await prisma.attendanceSession.findMany({ where: { sectionId } });
    for (const s of sessions) {
      await prisma.attendanceRecord.deleteMany({ where: { sessionId: s.id } });
    }
    await prisma.attendanceSession.deleteMany({ where: { sectionId } });
    await prisma.section.delete({ where: { id: sectionId } });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SECTION_DELETED",
      entityType: "Section",
      entityId: sectionId,
      details: { name: section.name, yearLevel: section.yearLevel },
    });

    return NextResponse.json({ success: true, message: "Section removed successfully." });
  } catch (error: any) {
    console.error("Delete section error:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
