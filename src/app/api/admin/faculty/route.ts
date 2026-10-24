import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const createFacultySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(6).default("Faculty123!"),
  facultyIdNumber: z.string().min(3),
  department: z.string().default("BSIT Department"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const faculty = await prisma.facultyProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        _count: { select: { schedules: true, createdSessions: true } },
      },
      orderBy: { facultyIdNumber: "asc" },
    });

    return NextResponse.json({ faculty });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch faculty" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = createFacultySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation error" }, { status: 400 });
    }

    const { name, email, password, facultyIdNumber, department } = result.data;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const existingFacultyId = await prisma.facultyProfile.findUnique({ where: { facultyIdNumber } });
    if (existingFacultyId) {
      return NextResponse.json({ error: "Faculty ID number already exists" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "FACULTY",
        status: "ACTIVE",
        facultyProfile: {
          create: {
            facultyIdNumber,
            department,
          },
        },
      },
      include: { facultyProfile: true },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "FACULTY_CREATED",
      entityType: "FacultyProfile",
      entityId: newUser.facultyProfile?.id,
      details: { name, facultyIdNumber },
    });

    return NextResponse.json({ success: true, faculty: newUser.facultyProfile });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create faculty member" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("id");
    if (!facultyId) {
      return NextResponse.json({ error: "Faculty ID is required" }, { status: 400 });
    }

    const profile = await prisma.facultyProfile.findUnique({
      where: { id: facultyId },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Faculty member not found" }, { status: 404 });
    }

    // Delete schedules & sessions created by this faculty
    await prisma.classSchedule.deleteMany({ where: { facultyId: profile.id } });
    const sessions = await prisma.attendanceSession.findMany({ where: { facultyId: profile.id } });
    for (const s of sessions) {
      await prisma.attendanceRecord.deleteMany({ where: { sessionId: s.id } });
    }
    await prisma.attendanceSession.deleteMany({ where: { facultyId: profile.id } });
    await prisma.facultyProfile.delete({ where: { id: profile.id } });
    await prisma.notification.deleteMany({ where: { userId: profile.userId } });
    await prisma.user.delete({ where: { id: profile.userId } });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "FACULTY_DELETED",
      entityType: "FacultyProfile",
      entityId: profile.id,
      details: {
        facultyIdNumber: profile.facultyIdNumber,
        name: profile.user.name,
        email: profile.user.email,
      },
    });

    return NextResponse.json({ success: true, message: "Faculty member removed successfully." });
  } catch (error: any) {
    console.error("Delete faculty error:", error);
    return NextResponse.json({ error: "Failed to remove faculty member" }, { status: 500 });
  }
}
