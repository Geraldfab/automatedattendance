import prisma from "@/lib/prisma";

/**
 * Ensures that students in a section are enrolled in all subjects scheduled for that section.
 * If sectionId is provided, syncs that section; otherwise syncs all sections.
 */
export async function syncSectionEnrollments(targetSectionId?: string) {
  try {
    const activeTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true },
    }) || await prisma.academicTerm.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!activeTerm) {
      console.warn("[syncSectionEnrollments] No academic term found.");
      return { synced: 0 };
    }

    const sectionWhere = targetSectionId ? { id: targetSectionId } : {};
    const sections = await prisma.section.findMany({
      where: sectionWhere,
      include: {
        students: { select: { id: true } },
        schedules: { select: { subjectId: true, termId: true } },
      },
    });

    let count = 0;
    for (const sec of sections) {
      if (sec.students.length === 0 || sec.schedules.length === 0) continue;

      const subjectIds = Array.from(new Set(sec.schedules.map((s) => s.subjectId)));

      for (const student of sec.students) {
        for (const subjectId of subjectIds) {
          await prisma.classEnrollment.upsert({
            where: {
              studentId_subjectId_termId: {
                studentId: student.id,
                subjectId,
                termId: activeTerm.id,
              },
            },
            update: {
              sectionId: sec.id,
              status: "ENROLLED",
            },
            create: {
              studentId: student.id,
              subjectId,
              sectionId: sec.id,
              termId: activeTerm.id,
              status: "ENROLLED",
            },
          });
          count++;
        }
      }
    }

    return { synced: count };
  } catch (error) {
    console.error("[syncSectionEnrollments] Error syncing enrollments:", error);
    return { error };
  }
}
