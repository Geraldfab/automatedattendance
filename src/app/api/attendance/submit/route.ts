import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { evaluateAttendanceStatus } from "@/lib/attendance-engine";
import { parseQRPayload } from "@/lib/qr";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const submitSchema = z.object({
  payload: z.string().min(1, "QR code payload is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT" || !user.studentProfileId) {
      return NextResponse.json(
        { error: "Unauthorized. Only authenticated BSIT students can submit attendance." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = submitSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid QR code format." }, { status: 400 });
    }

    const parsed = parseQRPayload(result.data.payload);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid attendance QR code. Please ensure you are scanning an authorized TCCI attendance session." },
        { status: 400 }
      );
    }

    const { sessionId, token } = parsed;

    // 1. Fetch the Session
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Attendance session not found or has been removed." }, { status: 404 });
    }

    // 2. Validate Session Status
    if (session.status !== "ACTIVE") {
      return NextResponse.json(
        { error: `This attendance session is currently ${session.status.toLowerCase()}. Submissions are no longer accepted.` },
        { status: 400 }
      );
    }

    // 3. Validate Session Expiry
    const now = new Date();
    if (now > session.endTime) {
      return NextResponse.json(
        { error: "This attendance session has already expired. Contact your instructor for manual assistance." },
        { status: 400 }
      );
    }

    // 4. Validate Token
    if (session.qrToken !== token) {
      return NextResponse.json(
        { error: "This QR code token has expired or was refreshed. Please scan the current live QR code on screen." },
        { status: 400 }
      );
    }

    // 5. Validate Enrollment
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        studentId: user.studentProfileId,
        subjectId: session.subjectId,
        sectionId: session.sectionId,
        status: "ENROLLED",
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          error: `You are not enrolled in ${session.subject.code} (${session.section.name}). Unauthorized submission rejected.`,
        },
        { status: 403 }
      );
    }

    // 6. Check for Duplicate Submission
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: user.studentProfileId,
        },
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        {
          error: `Duplicate Submission Prevented: You have already checked in for this session as ${existingRecord.status} at ${existingRecord.checkInTime?.toLocaleTimeString("en-PH") || "earlier"}.`,
          record: existingRecord,
        },
        { status: 409 }
      );
    }

    // 7. Calculate Status (Present vs Late)
    const { status, message } = evaluateAttendanceStatus(
      now,
      session.startTime,
      session.presentCutoffMinutes,
      session.lateCutoffMinutes
    );

    // 8. Create Record
    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: user.studentProfileId,
        status,
        checkInTime: now,
        submissionMethod: "QR_SCAN",
      },
    });

    // 9. Send Notification to Student
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: `Attendance Recorded: ${session.subject.code}`,
        message: `Your attendance was recorded as ${status} for ${session.subject.name} (${session.section.name}). ${message}`,
        type: "ATTENDANCE_SUCCESS",
      },
    });

    // 10. Audit Log
    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: "STUDENT",
      action: "ATTENDANCE_SUBMITTED",
      entityType: "AttendanceRecord",
      entityId: record.id,
      details: {
        sessionId: session.id,
        subjectCode: session.subject.code,
        status,
        checkInTime: now.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      status,
      message,
      checkInTime: now.toISOString(),
      subject: session.subject.code,
      subjectName: session.subject.name,
      section: session.section.name,
      facultyName: session.faculty.user.name,
      recordId: record.id,
    });
  } catch (error: any) {
    console.error("Attendance submission error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate Submission Prevented: You have already submitted attendance for this session." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to process attendance submission." }, { status: 500 });
  }
}
