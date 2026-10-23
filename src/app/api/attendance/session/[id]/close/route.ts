import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { finalizeSessionAbsences } from "@/lib/attendance-engine";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "FACULTY" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: params.id },
      include: { subject: true, section: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Role check
    if (user.role === "FACULTY" && session.facultyId !== user.facultyProfileId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update status to CLOSED
    const updated = await prisma.attendanceSession.update({
      where: { id: params.id },
      data: { status: "CLOSED" },
    });

    // Mark remaining enrolled students as ABSENT
    await finalizeSessionAbsences(session.id, user.id);

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "ATTENDANCE_SESSION_CLOSED",
      entityType: "AttendanceSession",
      entityId: session.id,
      details: {
        subject: session.subject.code,
        section: session.section.name,
        closedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance session closed and unrecorded absences finalized.",
      session: updated,
    });
  } catch (error: any) {
    console.error("Session close error:", error);
    return NextResponse.json({ error: "Failed to close session" }, { status: 500 });
  }
}
