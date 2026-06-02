import { NextResponse } from "next/server";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH, SESSION_COOKIE } from "@/lib/auth/constants";
import { authenticateWithPassword, authenticateWithPin } from "@/lib/auth/credentials";
import {
  createSessionPayload,
  serializeSessionCookie,
  sessionCookieOptions,
} from "@/lib/auth/session";

type LoginScope = "employee" | "admin";

type LoginBody =
  | { pin: string; scope?: LoginScope }
  | { username: string; password: string; scope?: LoginScope };

function isPinLogin(body: LoginBody): body is { pin: string; scope?: LoginScope } {
  return "pin" in body && typeof body.pin === "string";
}

function isPasswordLogin(
  body: LoginBody,
): body is { username: string; password: string; scope?: LoginScope } {
  return "username" in body && "password" in body;
}

export async function POST(request: Request) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const scope: LoginScope = body.scope === "admin" ? "admin" : "employee";

  let employee = null;

  if (isPinLogin(body)) {
    const pin = body.pin.trim();
    if (!/^\d+$/.test(pin) || pin.length < PIN_MIN_LENGTH || pin.length > PIN_MAX_LENGTH) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
    }
    employee = await authenticateWithPin(pin);
  } else if (isPasswordLogin(body)) {
    const username = body.username.trim();
    const password = body.password;
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    employee = await authenticateWithPassword(username, password);
  } else {
    return NextResponse.json({ error: "Provide pin or username and password" }, { status: 400 });
  }

  if (!employee) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (scope === "admin" && employee.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const session = createSessionPayload({
    employeeId: employee.id,
    branchId: employee.branchId,
    role: employee.role,
    authType: employee.authType,
  });

  const response = NextResponse.json({
    ok: true,
    role: employee.role,
    name: employee.name,
    redirectTo: employee.role === "admin" ? "/admin" : "/home",
  });

  response.cookies.set(
    SESSION_COOKIE,
    await serializeSessionCookie(session),
    sessionCookieOptions(),
  );

  return response;
}
