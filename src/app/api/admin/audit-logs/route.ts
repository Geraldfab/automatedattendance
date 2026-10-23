import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const where: any = {};
    if (action && action !== "ALL") where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actorUser: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
