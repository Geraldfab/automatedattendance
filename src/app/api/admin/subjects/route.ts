import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { z } from "zod";

const subjectSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  description: z.string().optional(),
  units: z.number().min(1).max(6).default(3),
});

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: { select: { schedules: true, enrollments: true, sessions: true } },
      },
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = subjectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Validation error" }, { status: 400 });
    }

    const { code, name, description, units } = result.data;
    const existing = await prisma.subject.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: `Subject code ${code} already exists.` }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        units,
      },
    });

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "SUBJECT_CREATED",
      entityType: "Subject",
      entityId: subject.id,
      details: { code: subject.code, name: subject.name },
    });

    return NextResponse.json({ success: true, subject });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
