import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const signupSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid institutional email"),
  studentIdNumber: z.string().min(3, "Student ID Number is required"),
  yearLevel: z.number().min(1).max(5).default(1),
  sectionId: z.string().optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, studentIdNumber, yearLevel, sectionId, password } = result.data;

    // Check if email already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Check if Student ID Number already registered
    const existingId = await prisma.studentProfile.findUnique({
      where: { studentIdNumber },
    });
    if (existingId) {
      return NextResponse.json(
        { error: "This Student ID Number is already registered in the system." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create User and StudentProfile
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
            program: "BSIT",
            yearLevel,
            sectionId: sectionId || null,
            enrollmentStatus: "REGULAR",
          },
        },
      },
      include: {
        studentProfile: {
          include: { section: true },
        },
      },
    });

    const studentProfile = newUser.studentProfile!;

    // Auto-enroll in subjects for their section if section is selected
    if (sectionId) {
      const activeTerm = await prisma.academicTerm.findFirst({
        where: { isActive: true },
      });

      // Find all scheduled subjects for this section
      const sectionSchedules = await prisma.classSchedule.findMany({
        where: { sectionId },
        select: { subjectId: true },
      });

      const uniqueSubjectIds = Array.from(new Set(sectionSchedules.map((s) => s.subjectId)));

      if (uniqueSubjectIds.length > 0 && activeTerm) {
        await prisma.classEnrollment.createMany({
          data: uniqueSubjectIds.map((subId) => ({
            studentId: studentProfile.id,
            subjectId: subId,
            sectionId,
            termId: activeTerm.id,
            status: "ENROLLED",
          })),
        });
      }
    }

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Welcome to Torres Capitol College Inc.",
        message: `Your BSIT Student account (${studentIdNumber}) is now active. You can view your classes and scan attendance QR codes.`,
        type: "SYSTEM_WELCOME",
      },
    });

    // Audit Log
    await createAuditLog({
      actorUserId: newUser.id,
      actorName: newUser.name,
      actorRole: "STUDENT",
      action: "STUDENT_SIGNUP",
      entityType: "User",
      entityId: newUser.id,
      details: {
        studentIdNumber,
        yearLevel,
        sectionId,
        program: "BSIT",
      },
    });

    // Generate Session Token & Cookie for automatic login
    const sessionPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: "STUDENT" as const,
      studentProfileId: studentProfile.id,
      studentIdNumber: studentProfile.studentIdNumber,
      sectionName: studentProfile.section?.name,
      yearLevel: studentProfile.yearLevel,
    };

    const token = await createSessionToken(sessionPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: "Student account created successfully.",
      user: sessionPayload,
    });
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Registration service error. Please try again." },
      { status: 500 }
    );
  }
}
