import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const createStudentSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters").default("Student123!"),
  studentIdNumber: z.string().min(4, "Student ID Number is required"),
  yearLevel: z.number().min(1).max(5).default(1),
  sectionId: z.string().optional().nullable(),
  program: z.string().default("BSIT"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sectionId = searchParams.get("sectionId");

    const where: any = {};
    if (sectionId) where.sectionId = sectionId;
    if (search) {
      where.OR = [
        { studentIdNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        section: true,
        _count: { select: { attendanceRecords: true, enrollments: true } },
      },
      orderBy: { studentIdNumber: "asc" },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = createStudentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }

    const { name, email, password, studentIdNumber, yearLevel, sectionId, program } = result.data;

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: "Email address is already registered." }, { status: 400 });
    }

    // Check existing ID number
    const existingId = await prisma.studentProfile.findUnique({ where: { studentIdNumber } });
    if (existingId) {
      return NextResponse.json({ error: "Student ID Number already exists." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        studentProfile: {
          create: {
            studentIdNumber,
            yearLevel,
            sectionId: sectionId || null,
            program,
          },
        },
      },
      include: {
        studentProfile: { include: { section: true } },
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "STUDENT_CREATED",
      entityType: "StudentProfile",
      entityId: newUser.studentProfile?.id,
      details: { studentIdNumber, name, email },
    });

    return NextResponse.json({ success: true, student: newUser.studentProfile });
  } catch (error: any) {
    console.error("Student creation error:", error);
    return NextResponse.json({ error: "Failed to create student account" }, { status: 500 });
  }
}
