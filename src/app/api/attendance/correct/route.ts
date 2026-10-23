import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const correctSchema = z.object({
  recordId: z.string().optional(),
  sessionId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]),
  reason: z.string().min(5, "A descriptive reason (min 5 characters) is required for attendance audit trail."),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "FACULTY" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const result = correctSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { recordId, sessionId, studentId, status, reason } = result.data;

    let targetRecord = null;
    if (recordId) {
      targetRecord = await prisma.attendanceRecord.findUnique({
        where: { id: recordId },
        include: { session: true, student: { include: { user: true } } },
      });
    } else if (sessionId && studentId) {
      targetRecord = await prisma.attendanceRecord.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId,
          },
        },
        include: { session: true, student: { include: { user: true } } },
      });
    }

    // Role check: Faculty can only modify their own sessions
    if (targetRecord && user.role === "FACULTY" && targetRecord.session.facultyId !== user.facultyProfileId) {
      return NextResponse.json({ error: "You are not authorized to modify attendance for this class." }, { status: 403 });
    }

    let updatedRecord;
    let oldStatus = "NONE";

    if (targetRecord) {
      oldStatus = targetRecord.status;
      updatedRecord = await prisma.attendanceRecord.update({
        where: { id: targetRecord.id },
        data: {
          status,
          correctionReason: reason,
          lastModifiedByUserId: user.id,
          submissionMethod: targetRecord.submissionMethod === "QR_SCAN" ? "QR_SCAN" : "FACULTY_MANUAL",
        },
        include: { student: { include: { user: true } } },
      });
    } else if (sessionId && studentId) {
      // Create new manual record
      const session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } });
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      if (user.role === "FACULTY" && session.facultyId !== user.facultyProfileId) {
        return NextResponse.json({ error: "Unauthorized for this class" }, { status: 403 });
      }

      updatedRecord = await prisma.attendanceRecord.create({
        data: {
          sessionId,
          studentId,
          status,
          checkInTime: new Date(),
          submissionMethod: "FACULTY_MANUAL",
          correctionReason: reason,
          lastModifiedByUserId: user.id,
        },
        include: { student: { include: { user: true } } },
      });
    } else {
      return NextResponse.json({ error: "Record identifier or Session + Student required" }, { status: 400 });
    }

    // Create Audit Log
    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "ATTENDANCE_CORRECTED",
      entityType: "AttendanceRecord",
      entityId: updatedRecord.id,
      details: {
        studentName: updatedRecord.student.user.name,
        studentIdNumber: updatedRecord.student.studentIdNumber,
        oldStatus,
        newStatus: status,
        reason,
      },
    });

    // Notify Student of correction
    await prisma.notification.create({
      data: {
        userId: updatedRecord.student.userId,
        title: "Attendance Record Updated",
        message: `Your attendance record was updated to ${status} by ${user.name}. Reason: ${reason}`,
        type: "ATTENDANCE_WARNING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance record successfully corrected and logged in audit trail.",
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("Attendance correction error:", error);
    return NextResponse.json({ error: "Failed to correct attendance record" }, { status: 500 });
  }
}
