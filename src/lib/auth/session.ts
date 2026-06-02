import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";

export type SessionRole = "employee" | "admin";
export type SessionAuthType = "pin" | "password";

export type SessionData = {
  employeeId: string;
  branchId: string;
  role: SessionRole;
  authType: SessionAuthType;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value + "===".slice((value.length + 3) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index++) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function signPayload(payload: string): Promise<string> {
  const signature = await hmacSign(payload, getSessionSecret());
  return `${payload}.${signature}`;
}

async function verifySignedValue(value: string): Promise<string | null> {
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return null;

  const payload = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expected = await hmacSign(payload, getSessionSecret());

  if (!timingSafeEqualString(signature, expected)) return null;
  return payload;
}

async function encodeSession(session: SessionData): Promise<string> {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  return signPayload(payload);
}

async function decodeSession(value: string): Promise<SessionData | null> {
  const payload = await verifySignedValue(value);
  if (!payload) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    const session = JSON.parse(json) as SessionData;
    if (
      !session.employeeId ||
      !session.branchId ||
      !session.role ||
      !session.authType ||
      !session.exp
    ) {
      return null;
    }
    if (session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function createSessionPayload(input: Omit<SessionData, "exp">): SessionData {
  return {
    ...input,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
}

export async function serializeSessionCookie(session: SessionData): Promise<string> {
  return encodeSession(session);
}

export async function parseSessionCookie(value: string | undefined): Promise<SessionData | null> {
  if (!value) return null;
  return decodeSession(value);
}

export async function getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
  return parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  return parseSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
