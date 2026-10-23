import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "tcci-bsit-super-secret-jwt-key-2024-default";
const secretKey = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = "tcci_session_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "FACULTY" | "STUDENT";
  studentProfileId?: string;
  studentIdNumber?: string;
  facultyProfileId?: string;
  facultyIdNumber?: string;
  sectionName?: string;
  yearLevel?: number;
}

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

export async function createSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch (e) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function removeAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function fetchFullUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: {
        include: {
          section: true,
        },
      },
      facultyProfile: true,
    },
  });
}
