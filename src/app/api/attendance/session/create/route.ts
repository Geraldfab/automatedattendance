import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateRandomToken, formatQRContent, generateQRCodeDataUrl } from "@/lib/qr";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const createSessionSchema = z.object({
  scheduleId: z.string().optional().nullable(),
  subjectId: z.string().min(1, "Subject is required"),
  sectionId: z.string().min(1, "Section is required"),
  durationMinutes: z.number().min(5).max(480).default(90),
  presentCutoffMinutes: z.number().min(1).max(120).default(15),
  lateCutoffMinutes: z.number().min(5).max(180).default(45),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "FACULTY" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const result = createSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input data", details: result.error.format() }, { status: 400 });
    }

    const {
      scheduleId,
      subjectId,
      sectionId,
      durationMinutes,
      presentCutoffMinutes,
      lateCutoffMinutes,
      notes,
    } = result.data;

    // Determine facultyId
    let facultyProfileId = user.facultyProfileId;
    if (user.role === "ADMIN" && !facultyProfileId) {
      // If admin creates, assign first available faculty or schedule's faculty
      if (scheduleId) {
        const schedule = await prisma.classSchedule.findUnique({ where: { id: scheduleId } });
        if (schedule) facultyProfileId = schedule.facultyId;
      }
      if (!facultyProfileId) {
        const firstFaculty = await prisma.facultyProfile.findFirst();
        facultyProfileId = firstFaculty?.id;
      }
    }

    if (!facultyProfileId) {
      return NextResponse.json({ error: "No authorized faculty member profile found to associate with session." }, { status: 400 });
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const initialToken = generateRandomToken();

    const session = await prisma.attendanceSession.create({
      data: {
        scheduleId: scheduleId || null,
        facultyId: facultyProfileId,
        subjectId,
        sectionId,
        sessionDate: now,
        startTime: now,
        endTime,
        qrToken: initialToken,
        status: "ACTIVE",
        presentCutoffMinutes,
        lateCutoffMinutes,
        notes: notes || "Class Attendance Session",
      },
      include: {
        subject: true,
        section: true,
        faculty: { include: { user: true } },
      },
    });

    const qrPayload = formatQRContent(session.id, initialToken);
    const qrDataUrl = await generateQRCodeDataUrl(qrPayload);

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "ATTENDANCE_SESSION_CREATED",
      entityType: "AttendanceSession",
      entityId: session.id,
      details: {
        subject: session.subject.code,
        section: session.section.name,
        durationMinutes,
      },
    });

    return NextResponse.json({
      success: true,
      session,
      qrToken: initialToken,
      qrPayload,
      qrDataUrl,
    });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create attendance session" }, { status: 500 });
  }
}
