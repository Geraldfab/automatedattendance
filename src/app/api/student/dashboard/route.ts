import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateAttendanceStats } from "@/lib/attendance-engine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT" || !user.studentProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: user.studentProfileId },
      include: {
        user: true,
        section: true,
        enrollments: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Fetch all records for this student
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId: studentProfile.id },
      include: {
        session: {
          include: {
            subject: true,
            section: true,
            faculty: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const overallStats = calculateAttendanceStats(records);

    // Calculate subject-by-subject breakdown
    const subjectBreakdown = studentProfile.enrollments.map((enr) => {
      const subjectRecords = records.filter(
        (r) => r.session.subjectId === enr.subjectId
      );
      const subStats = calculateAttendanceStats(subjectRecords);
      return {
        subjectId: enr.subjectId,
        subjectCode: enr.subject.code,
        subjectName: enr.subject.name,
        units: enr.subject.units,
        totalSessions: subStats.total,
        present: subStats.present,
        late: subStats.late,
        absent: subStats.absent,
        excused: subStats.excused,
        attendanceRate: subStats.attendanceRate,
        isAtRisk: subStats.isAtRisk,
      };
    });

    // Check for any currently ACTIVE session for this student's section
    const activeSessions = await prisma.attendanceSession.findMany({
      where: {
        sectionId: studentProfile.sectionId || undefined,
        status: "ACTIVE",
        endTime: { gt: new Date() },
      },
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
      },
    });

    // Check if student has already checked into active sessions
    const activeSessionsWithCheckIn = activeSessions.map((s) => {
      const checkedIn = records.some((r) => r.sessionId === s.id);
      return {
        ...s,
        hasCheckedIn: checkedIn,
      };
    });

    // Schedules for student's section
    const schedules = await prisma.classSchedule.findMany({
      where: { sectionId: studentProfile.sectionId || undefined },
      include: {
        subject: true,
        faculty: { include: { user: true } },
      },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      student: {
        id: studentProfile.id,
        name: studentProfile.user.name,
        email: studentProfile.user.email,
        studentIdNumber: studentProfile.studentIdNumber,
        program: studentProfile.program,
        yearLevel: studentProfile.yearLevel,
        sectionName: studentProfile.section?.name || "Unassigned",
        enrollmentStatus: studentProfile.enrollmentStatus,
      },
      overallStats,
      subjectBreakdown,
      activeSessions: activeSessionsWithCheckIn,
      recentRecords: records.slice(0, 10),
      schedules,
    });
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    return NextResponse.json({ error: "Failed to load student dashboard" }, { status: 500 });
  }
}
