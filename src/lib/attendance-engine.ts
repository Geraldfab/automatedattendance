import prisma from "./prisma";
import { createAuditLog } from "./audit";

export interface AttendanceStatusResult {
  status: "PRESENT" | "LATE" | "ABSENT";
  message: string;
}

/**
 * Calculates whether student is PRESENT, LATE, or ABSENT based on session start and cutoff windows.
 */
export function evaluateAttendanceStatus(
  checkInTime: Date,
  sessionStartTime: Date,
  presentCutoffMinutes: number = 15,
  lateCutoffMinutes: number = 45
): AttendanceStatusResult {
  const diffMs = checkInTime.getTime() - sessionStartTime.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes <= presentCutoffMinutes) {
    return {
      status: "PRESENT",
      message: `Checked in on time (${diffMinutes} min into class)`,
    };
  }

  if (diffMinutes <= lateCutoffMinutes) {
    return {
      status: "LATE",
      message: `Late arrival (${diffMinutes} min into class, grace window was ${presentCutoffMinutes} min)`,
    };
  }

  return {
    status: "ABSENT",
    message: `Checked in after late cutoff threshold (${diffMinutes} min > ${lateCutoffMinutes} min)`,
  };
}

/**
 * Automatically finalize unrecorded enrolled students as ABSENT when session closes.
 */
export async function finalizeSessionAbsences(sessionId: string, actorUserId?: string) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      section: true,
      subject: true,
      records: true,
    },
  });

  if (!session) return;

  // Get all active enrollments for this subject and section
  const enrollments = await prisma.classEnrollment.findMany({
    where: {
      subjectId: session.subjectId,
      sectionId: session.sectionId,
      status: "ENROLLED",
    },
    select: {
      studentId: true,
    },
  });

  const recordedStudentIds = new Set(session.records.map((r) => r.studentId));
  const unrecordedStudents = enrollments.filter((e) => !recordedStudentIds.has(e.studentId));

  if (unrecordedStudents.length > 0) {
    const unrecordedData = unrecordedStudents.map((e) => ({
      sessionId: session.id,
      studentId: e.studentId,
      status: "ABSENT",
      submissionMethod: "AUTO_ABSENT",
      correctionReason: "Auto-marked absent: No submission recorded prior to session closing.",
    }));

    await prisma.attendanceRecord.createMany({
      data: unrecordedData,
    });

    await createAuditLog({
      actorUserId,
      actorName: "System / Faculty",
      actorRole: "SYSTEM",
      action: "SESSION_ABSENCES_FINALIZED",
      entityType: "AttendanceSession",
      entityId: session.id,
      details: {
        totalAbsentMarked: unrecordedStudents.length,
        sessionId: session.id,
      },
    });
  }
}

/**
 * Calculates overall attendance statistics for a list of records.
 */
export function calculateAttendanceStats(records: { status: string }[]) {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      attendanceRate: 100,
      isAtRisk: false,
    };
  }

  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const excused = records.filter((r) => r.status === "EXCUSED").length;

  // Torres Capitol College Inc. standard formula:
  // (Present + (Late * 0.75) + Excused) / Total * 100
  const effectivePresent = present + late * 0.75 + excused;
  const attendanceRate = Math.min(100, Math.round((effectivePresent / total) * 100 * 10) / 10);

  const isAtRisk = attendanceRate < 80.0;

  return {
    total,
    present,
    late,
    absent,
    excused,
    attendanceRate,
    isAtRisk,
  };
}
