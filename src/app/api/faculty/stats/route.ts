import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateAttendanceStats } from "@/lib/attendance-engine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "FACULTY" || !user.facultyProfileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [schedules, sessions, assignedClasses] = await Promise.all([
      prisma.classSchedule.findMany({
        where: { facultyId: user.facultyProfileId },
        include: { subject: true, section: true },
      }),
      prisma.attendanceSession.findMany({
        where: { facultyId: user.facultyProfileId },
        include: {
          subject: true,
          section: true,
          records: true,
        },
        orderBy: { sessionDate: "desc" },
      }),
      prisma.classSchedule.findMany({
        where: { facultyId: user.facultyProfileId },
        distinct: ["subjectId", "sectionId"],
        include: {
          subject: true,
          section: true,
        },
      }),
    ]);

    // Active session currently running
    const activeSession = sessions.find((s) => s.status === "ACTIVE") || null;

    // All records across faculty sessions
    const allRecords = sessions.flatMap((s) => s.records);
    const overallStats = calculateAttendanceStats(allRecords);

    // Group by class to find attendance rate per class
    const classStats = assignedClasses.map((ac) => {
      const classSessions = sessions.filter(
        (s) => s.subjectId === ac.subjectId && s.sectionId === ac.sectionId
      );
      const classRecords = classSessions.flatMap((s) => s.records);
      const stats = calculateAttendanceStats(classRecords);
      return {
        id: `${ac.subjectId}-${ac.sectionId}`,
        subjectCode: ac.subject.code,
        subjectName: ac.subject.name,
        sectionName: ac.section.name,
        totalSessions: classSessions.length,
        attendanceRate: stats.attendanceRate,
        present: stats.present,
        late: stats.late,
        absent: stats.absent,
        excused: stats.excused,
      };
    });

    // Detect at-risk students enrolled in faculty's classes
    const classSubjectIds = assignedClasses.map((ac) => ac.subjectId);
    const classSectionIds = assignedClasses.map((ac) => ac.sectionId);

    const enrolledStudents = await prisma.classEnrollment.findMany({
      where: {
        subjectId: { in: classSubjectIds },
        sectionId: { in: classSectionIds },
        status: "ENROLLED",
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            section: true,
          },
        },
        subject: true,
      },
    });

    const studentMap = new Map<string, { student: any; subject: any; records: any[] }>();
    enrolledStudents.forEach((enr) => {
      const key = `${enr.studentId}-${enr.subjectId}`;
      const recs = allRecords.filter(
        (r) => r.studentId === enr.studentId && sessions.some((s) => s.id === r.sessionId && s.subjectId === enr.subjectId)
      );
      studentMap.set(key, {
        student: enr.student,
        subject: enr.subject,
        records: recs,
      });
    });

    const atRiskList: any[] = [];
    studentMap.forEach(({ student, subject, records }) => {
      if (records.length >= 2) {
        const sStat = calculateAttendanceStats(records);
        if (sStat.isAtRisk) {
          atRiskList.push({
            studentId: student.id,
            studentName: student.user.name,
            studentIdNumber: student.studentIdNumber,
            sectionName: student.section?.name,
            subjectCode: subject.code,
            subjectName: subject.name,
            attendanceRate: sStat.attendanceRate,
            absentCount: sStat.absent,
          });
        }
      }
    });

    return NextResponse.json({
      summary: {
        totalClasses: assignedClasses.length,
        totalSessions: sessions.length,
        overallAttendanceRate: overallStats.attendanceRate,
        presentCount: overallStats.present,
        lateCount: overallStats.late,
        absentCount: overallStats.absent,
        excusedCount: overallStats.excused,
        atRiskCount: atRiskList.length,
      },
      activeSession,
      schedules,
      classStats,
      recentSessions: sessions.slice(0, 5),
      atRiskList,
    });
  } catch (error: any) {
    console.error("Faculty stats error:", error);
    return NextResponse.json({ error: "Failed to load faculty stats" }, { status: 500 });
  }
}
