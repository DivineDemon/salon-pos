import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sales } from "@/lib/db/schema";

function startOfTodayMuscat(): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Muscat",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";

  return new Date(`${year}-${month}-${day}T00:00:00+04:00`);
}

export type TodaySummary = {
  saleCount: number;
  revenueTotal: number;
};

export async function getTodaySummary(branchId: string, employeeId: string): Promise<TodaySummary> {
  const db = getDb();
  const since = startOfTodayMuscat();

  const [row] = await db
    .select({
      saleCount: sql<number>`count(*)::int`,
      revenueTotal: sql<string>`coalesce(sum(${sales.total}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.branchId, branchId),
        eq(sales.employeeId, employeeId),
        gte(sales.createdAt, since),
      ),
    );

  return {
    saleCount: row?.saleCount ?? 0,
    revenueTotal: Number.parseFloat(row?.revenueTotal ?? "0") || 0,
  };
}
