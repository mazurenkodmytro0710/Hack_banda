import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { Role } from "./types";

export const COOKIE_NAME = "openarm_session";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

function readCookie(cookieHeader: string | null | undefined, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) return null;

  return decodeURIComponent(match.slice(name.length + 1));
}

export interface SessionPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookieHeader(cookieHeader: string | null | undefined) {
  const token = readCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;
  return await verifySession(token);
}

export async function getSessionFromRequest(req: Request) {
  return await getSessionFromCookieHeader(req.headers.get("cookie"));
}

export async function getSession(): Promise<SessionPayload | null> {
  const { headers } = await import("next/headers");
  return await getSessionFromCookieHeader(headers().get("cookie"));
}

export function applySessionCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
