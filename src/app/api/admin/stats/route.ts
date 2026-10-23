import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateAttendanceStats } from "@/lib/attendance-engine";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalSections,
      totalSessions,
      records,
      auditLogs,
      recentSessions,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.subject.count(),
      prisma.section.count(),
      prisma.attendanceSession.count(),
      prisma.attendanceRecord.findMany({
        select: {
          status: true,
          createdAt: true,
          studentId: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.attendanceSession.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          section: true,
          faculty: { include: { user: true } },
          _count: { select: { records: true } },
        },
      }),
    ]);

    const stats = calculateAttendanceStats(records);

    // Group records by student to find at-risk students (< 80%)
    const studentRecordMap = new Map<string, { status: string }[]>();
    for (const r of records) {
      if (!studentRecordMap.has(r.studentId)) {
        studentRecordMap.set(r.studentId, []);
      }
      studentRecordMap.get(r.studentId)!.push(r);
    }

    const atRiskStudentIds: string[] = [];
    studentRecordMap.forEach((recs, studentId) => {
      const sStats = calculateAttendanceStats(recs);
      if (sStats.isAtRisk && recs.length >= 2) {
        atRiskStudentIds.push(studentId);
      }
    });

    const atRiskStudents = await prisma.studentProfile.findMany({
      where: { id: { in: atRiskStudentIds } },
      include: {
        user: { select: { name: true, email: true } },
        section: true,
      },
    });

    // Daily attendance trends for chart
    const last7DaysMap = new Map<string, { date: string; present: number; late: number; absent: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
      last7DaysMap.set(key, { date: key, present: 0, late: 0, absent: 0 });
    }

    for (const r of records) {
      const key = new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
      if (last7DaysMap.has(key)) {
        const item = last7DaysMap.get(key)!;
        if (r.status === "PRESENT") item.present++;
        else if (r.status === "LATE") item.late++;
        else if (r.status === "ABSENT") item.absent++;
      }
    }

    return NextResponse.json({
      summary: {
        totalStudents,
        totalFaculty,
        totalSubjects,
        totalSections,
        totalSessions,
        attendanceRate: stats.attendanceRate,
        presentCount: stats.present,
        lateCount: stats.late,
        absentCount: stats.absent,
        excusedCount: stats.excused,
        atRiskCount: atRiskStudents.length,
      },
      trends: Array.from(last7DaysMap.values()),
      recentSessions,
      auditLogs,
      atRiskStudents,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
