import { and, eq } from "drizzle-orm";
import { verifyPassword, verifyPin } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { employees } from "@/lib/db/schema";
import type { SessionAuthType, SessionRole } from "./session";

export type AuthenticatedEmployee = {
  id: string;
  branchId: string;
  role: SessionRole;
  authType: SessionAuthType;
  name: string;
};

export async function authenticateWithPin(pin: string): Promise<AuthenticatedEmployee | null> {
  const db = getDb();
  const candidates = await db
    .select()
    .from(employees)
    .where(and(eq(employees.authType, "pin"), eq(employees.isActive, true)));

  for (const employee of candidates) {
    if (!employee.pinHash) continue;
    const valid = await verifyPin(pin, employee.pinHash);
    if (valid) {
      return {
        id: employee.id,
        branchId: employee.branchId,
        role: employee.role,
        authType: employee.authType,
        name: employee.name,
      };
    }
  }

  return null;
}

export async function authenticateWithPassword(
  username: string,
  password: string,
): Promise<AuthenticatedEmployee | null> {
  const db = getDb();
  const [employee] = await db
    .select()
    .from(employees)
    .where(
      and(
        eq(employees.authType, "password"),
        eq(employees.username, username.trim()),
        eq(employees.isActive, true),
      ),
    )
    .limit(1);

  if (!employee?.passwordHash) return null;

  const valid = await verifyPassword(password, employee.passwordHash);
  if (!valid) return null;

  return {
    id: employee.id,
    branchId: employee.branchId,
    role: employee.role,
    authType: employee.authType,
    name: employee.name,
  };
}
