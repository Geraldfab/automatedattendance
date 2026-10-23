import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateRandomToken, formatQRContent, generateQRCodeDataUrl } from "@/lib/qr";

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
    });

    if (!session || session.status !== "ACTIVE") {
      return NextResponse.json({ error: "Active session not found" }, { status: 404 });
    }

    const newToken = generateRandomToken();
    const updated = await prisma.attendanceSession.update({
      where: { id: params.id },
      data: {
        qrToken: newToken,
        qrRotatedAt: new Date(),
      },
    });

    const qrPayload = formatQRContent(session.id, newToken);
    const qrDataUrl = await generateQRCodeDataUrl(qrPayload);

    return NextResponse.json({
      success: true,
      qrToken: newToken,
      qrPayload,
      qrDataUrl,
      rotatedAt: updated.qrRotatedAt,
    });
  } catch (error: any) {
    console.error("QR rotation error:", error);
    return NextResponse.json({ error: "Failed to rotate QR code" }, { status: 500 });
  }
}
