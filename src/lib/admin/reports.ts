import { and, eq, gte, lte, sql } from "drizzle-orm";
import { type DateRange, resolveReportDateRange } from "@/lib/admin/date-range";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getDb } from "@/lib/db";
import { employees, expenses, sales } from "@/lib/db/schema";

export type SalesByEmployeeRow = {
  employeeId: string;
  employeeName: string;
  saleCount: number;
  revenueTotal: number;
};

export type ExpenseByCategoryRow = {
  category: string;
  total: number;
  count: number;
};

export type ReportData = {
  range: DateRange;
  salesByEmployee: SalesByEmployeeRow[];
  revenueTotal: number;
  saleCount: number;
  expensesTotal: number;
  expensesByCategory: ExpenseByCategoryRow[];
};

export async function getReportData(input: {
  branchId: string | null;
  from?: string;
  to?: string;
}): Promise<ReportData | null> {
  if (!(await requireAdmin())) return null;

  const dateRange = resolveReportDateRange(input.from, input.to);
  const db = getDb();

  const salesConditions = [
    gte(sales.createdAt, dateRange.from),
    lte(sales.createdAt, dateRange.to),
  ];
  if (input.branchId) {
    salesConditions.push(eq(sales.branchId, input.branchId));
  }

  const salesByEmployee = await db
    .select({
      employeeId: employees.id,
      employeeName: employees.name,
      saleCount: sql<number>`count(${sales.id})::int`,
      revenueTotal: sql<string>`coalesce(sum(${sales.total}), 0)`,
    })
    .from(sales)
    .innerJoin(employees, eq(sales.employeeId, employees.id))
    .where(and(...salesConditions))
    .groupBy(employees.id, employees.name)
    .orderBy(sql`coalesce(sum(${sales.total}), 0) desc`);

  const [revenueRow] = await db
    .select({
      saleCount: sql<number>`count(*)::int`,
      revenueTotal: sql<string>`coalesce(sum(${sales.total}), 0)`,
    })
    .from(sales)
    .where(and(...salesConditions));

  const expenseConditions = [
    gte(expenses.createdAt, dateRange.from),
    lte(expenses.createdAt, dateRange.to),
  ];
  if (input.branchId) {
    expenseConditions.push(eq(expenses.branchId, input.branchId));
  }

  const expensesByCategory = await db
    .select({
      category: expenses.category,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(and(...expenseConditions))
    .groupBy(expenses.category)
    .orderBy(sql`coalesce(sum(${expenses.amount}), 0) desc`);

  const [expenseTotalRow] = await db
    .select({
      expensesTotal: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(...expenseConditions));

  return {
    range: dateRange,
    salesByEmployee: salesByEmployee.map((row) => ({
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      saleCount: row.saleCount,
      revenueTotal: Number.parseFloat(row.revenueTotal) || 0,
    })),
    saleCount: revenueRow?.saleCount ?? 0,
    revenueTotal: Number.parseFloat(revenueRow?.revenueTotal ?? "0") || 0,
    expensesTotal: Number.parseFloat(expenseTotalRow?.expensesTotal ?? "0") || 0,
    expensesByCategory: expensesByCategory.map((row) => ({
      category: row.category,
      total: Number.parseFloat(row.total) || 0,
      count: row.count,
    })),
  };
}
