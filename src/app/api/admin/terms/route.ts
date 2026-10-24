import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const terms = await prisma.academicTerm.findMany({
      orderBy: { academicYear: "desc" },
    });
    return NextResponse.json({ terms });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
  }
}
