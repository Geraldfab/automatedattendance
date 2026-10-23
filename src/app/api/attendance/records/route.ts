import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const sectionId = searchParams.get("sectionId");
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};

    // Role restrictions
    if (user.role === "STUDENT") {
      where.studentId = user.studentProfileId;
    } else if (user.role === "FACULTY") {
      where.session = {
        facultyId: user.facultyProfileId,
      };
    }

    if (subjectId) {
      where.session = { ...where.session, subjectId };
    }
    if (sectionId) {
      where.session = { ...where.session, sectionId };
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (studentId) {
      where.studentId = studentId;
    }
    if (startDate || endDate) {
      where.session = {
        ...where.session,
        sessionDate: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {}),
        },
      };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            section: true,
          },
        },
        session: {
          include: {
            subject: true,
            section: true,
            faculty: { include: { user: { select: { name: true } } } },
          },
        },
        lastModifiedByUser: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error("Records query error:", error);
    return NextResponse.json({ error: "Failed to query records" }, { status: 500 });
  }
}
