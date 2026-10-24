import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const systemSettings = await prisma.systemSetting.findFirst();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      userCount,
      institution: systemSettings?.schoolName || "Torres Capitol College Inc.",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: Boolean(process.env.VERCEL),
        vercelEnv: process.env.VERCEL_ENV || "unknown",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: error?.message || "Unknown database error",
      },
      { status: 500 }
    );
  }
}
