import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

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
