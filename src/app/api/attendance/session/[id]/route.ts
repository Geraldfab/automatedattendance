import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatQRContent, generateQRCodeDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: params.id },
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
        schedule: true,
        records: {
          include: {
            student: {
              include: { user: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Role check: Faculty can only see their own sessions unless ADMIN
    if (user.role === "FACULTY" && session.facultyId !== user.facultyProfileId) {
      return NextResponse.json({ error: "Access denied to classes not assigned to you." }, { status: 403 });
    }

    // Fetch all enrolled students in this subject and section
    const enrollments = await prisma.classEnrollment.findMany({
      where: {
        subjectId: session.subjectId,
        sectionId: session.sectionId,
        status: "ENROLLED",
      },
      include: {
        student: {
          include: { user: true },
        },
      },
    });

    const qrPayload = formatQRContent(session.id, session.qrToken);
    const qrDataUrl = await generateQRCodeDataUrl(qrPayload);

    // Calculate live counts
    const presentCount = session.records.filter((r) => r.status === "PRESENT").length;
    const lateCount = session.records.filter((r) => r.status === "LATE").length;
    const absentCount = session.records.filter((r) => r.status === "ABSENT").length;
    const excusedCount = session.records.filter((r) => r.status === "EXCUSED").length;
    const totalExpected = enrollments.length;
    const remainingCount = Math.max(0, totalExpected - session.records.length);

    return NextResponse.json({
      session,
      qrToken: session.qrToken,
      qrPayload,
      qrDataUrl,
      enrollments,
      stats: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,
        totalCheckedIn: session.records.length,
        totalExpected,
        remainingCount,
      },
    });
  } catch (error: any) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
