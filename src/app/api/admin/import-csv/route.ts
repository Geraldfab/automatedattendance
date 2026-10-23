import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { csvData, sectionId } = await req.json();
    if (!csvData || typeof csvData !== "string") {
      return NextResponse.json({ error: "Invalid CSV payload." }, { status: 400 });
    }

    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or missing headers." }, { status: 400 });
    }

    // Header parse: name,email,studentIdNumber,yearLevel
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
    const nameIdx = headers.findIndex((h) => h.includes("name"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));
    const idIdx = headers.findIndex((h) => h.includes("id") || h.includes("student_id"));
    const yearIdx = headers.findIndex((h) => h.includes("year"));

    if (nameIdx === -1 || emailIdx === -1 || idIdx === -1) {
      return NextResponse.json(
        { error: "CSV must contain columns: name, email, studentIdNumber (and optional yearLevel)" },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];
    const defaultPasswordHash = await hashPassword("Student123!");

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const name = cols[nameIdx];
      const email = cols[emailIdx]?.toLowerCase();
      const studentIdNumber = cols[idIdx];
      const yearLevel = yearIdx !== -1 && cols[yearIdx] ? parseInt(cols[yearIdx], 10) : 1;

      if (!name || !email || !studentIdNumber) {
        errors.push(`Row ${i}: Missing required fields.`);
        continue;
      }

      // Check duplicate in DB
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { studentProfile: { studentIdNumber } }],
        },
      });

      if (existingUser) {
        errors.push(`Row ${i} (${email}): Account or Student ID already exists.`);
        continue;
      }

      try {
        await prisma.user.create({
          data: {
            name,
            email,
            passwordHash: defaultPasswordHash,
            role: "STUDENT",
            status: "ACTIVE",
            studentProfile: {
              create: {
                studentIdNumber,
                yearLevel: isNaN(yearLevel) ? 1 : yearLevel,
                sectionId: sectionId || null,
                program: "BSIT",
              },
            },
          },
        });
        successCount++;
      } catch (err: any) {
        errors.push(`Row ${i} (${email}): Failed to save record.`);
      }
    }

    await createAuditLog({
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "CSV_STUDENTS_IMPORTED",
      entityType: "StudentProfile",
      details: { successCount, totalAttempted: lines.length - 1, errorsCount: errors.length },
    });

    return NextResponse.json({
      success: true,
      successCount,
      errors,
      message: `Successfully imported ${successCount} student(s). ${errors.length} failed or skipped.`,
    });
  } catch (e) {
    console.error("CSV import error:", e);
    return NextResponse.json({ error: "Failed to process CSV file." }, { status: 500 });
  }
}
