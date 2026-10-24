import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      select: {
        id: true,
        name: true,
        yearLevel: true,
        program: true,
      },
      orderBy: [{ yearLevel: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(
      { sections },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}
