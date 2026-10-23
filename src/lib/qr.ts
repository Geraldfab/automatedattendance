import crypto from "crypto";
import QRCode from "qrcode";

export interface QRTokenData {
  sessionId: string;
  token: string;
  timestamp: number;
}

/**
 * Generate a random cryptographic session token.
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Encodes token data payload to present in QR code.
 * Example: TCCI-ATTEND:sessionId:token:timestamp
 */
export function formatQRContent(sessionId: string, token: string): string {
  const timestamp = Date.now();
  return JSON.stringify({
    prefix: "TCCI_ATTEND",
    sid: sessionId,
    t: token,
    ts: timestamp,
  });
}

/**
 * Generates base64 Data URL for QR Code image rendering.
 */
export async function generateQRCodeDataUrl(content: string): Promise<string> {
  return await QRCode.toDataURL(content, {
    width: 320,
    margin: 2,
    color: {
      dark: "#5b1429", // TCCI Deep Maroon
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Parse and validate incoming QR payload from student camera scan.
 */
export function parseQRPayload(rawPayload: string): { sessionId: string; token: string } | null {
  try {
    const parsed = JSON.parse(rawPayload);
    if (parsed.prefix === "TCCI_ATTEND" && parsed.sid && parsed.t) {
      return {
        sessionId: parsed.sid,
        token: parsed.t,
      };
    }
    // Also support fallback format "sessionId:token"
    if (typeof rawPayload === "string" && rawPayload.includes(":")) {
      const parts = rawPayload.split(":");
      if (parts.length >= 2) {
        return {
          sessionId: parts[0],
          token: parts[1],
        };
      }
    }
    return null;
  } catch (err) {
    // If not JSON, check if it's plain string format
    if (rawPayload && rawPayload.includes(":")) {
      const parts = rawPayload.split(":");
      return { sessionId: parts[0], token: parts[1] };
    }
    return null;
  }
}
