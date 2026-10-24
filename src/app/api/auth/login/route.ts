import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: {
          include: { section: true },
        },
        facultyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Account is inactive or suspended. Contact the BSIT Department." }, { status: 403 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "ADMIN" | "FACULTY" | "STUDENT",
      studentProfileId: user.studentProfile?.id,
      studentIdNumber: user.studentProfile?.studentIdNumber,
      facultyProfileId: user.facultyProfile?.id,
      facultyIdNumber: user.facultyProfile?.facultyIdNumber,
      sectionName: user.studentProfile?.section?.name,
      yearLevel: user.studentProfile?.yearLevel,
    };

    const token = await createSessionToken(sessionPayload);
    await setAuthCookie(token);

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });

    return NextResponse.json({
      success: true,
      user: sessionPayload,
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        error: "Authentication service error",
        details: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
