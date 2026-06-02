"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/intl/navigation";
import type { Locale } from "@/intl/routing";
import type { AdminBranch } from "@/lib/admin/queries";
import type { ReportData } from "@/lib/admin/reports";
import { formatOMR } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type ReportTab = "sales" | "revenue" | "expenses";
export type ReportRange = "today" | "week" | "custom";

type ReportsPanelProps = {
  branches: AdminBranch[];
  data: ReportData;
  locale: Locale;
  branchId: string | null;
  range: ReportRange;
  customFrom: string;
  customTo: string;
  tab: ReportTab;
};

export function ReportsPanel({
  branches,
  data,
  locale,
  branchId,
  range,
  customFrom,
  customTo,
  tab,
}: ReportsPanelProps) {
  const t = useTranslations("admin.reports");
  const router = useRouter();
  const pathname = usePathname();

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = {
      branch: branchId ?? undefined,
      range,
      from: customFrom || undefined,
      to: customTo || undefined,
      tab,
      ...patch,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const branchLabel = (branch: AdminBranch) => (locale === "ar" ? branch.nameAr : branch.nameEn);

  const netRevenue = data.revenueTotal - data.expensesTotal;

  function expenseCategoryLabel(category: string): string {
    const key = `expense_${category}` as "expense_supplies" | "expense_transport" | "expense_other";
    if (category === "supplies" || category === "transport" || category === "other") {
      return t(key);
    }
    return category;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={!branchId}
          label={t("allBranches")}
          onClick={() => updateParams({ branch: undefined })}
        />
        {branches.map((branch) => (
          <FilterChip
            key={branch.id}
            active={branchId === branch.id}
            label={branchLabel(branch)}
            onClick={() => updateParams({ branch: branch.id })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["today", "week", "custom"] as const).map((preset) => (
          <FilterChip
            key={preset}
            active={range === preset}
            label={t(`range_${preset}`)}
            onClick={() => updateParams({ range: preset })}
          />
        ))}
      </div>

      {range === "custom" ? (
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-salon-black">{t("from")}</span>
            <input
              type="date"
              className={dateInputClass}
              value={customFrom}
              onChange={(e) => updateParams({ from: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-salon-black">{t("to")}</span>
            <input
              type="date"
              className={dateInputClass}
              value={customTo}
              onChange={(e) => updateParams({ to: e.target.value })}
            />
          </label>
        </div>
      ) : null}

      <div className="flex gap-2 border-b border-salon-border">
        {(["sales", "revenue", "expenses"] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => updateParams({ tab: tabKey })}
            className={cn(
              "min-h-11 flex-1 border-b-2 px-2 text-sm font-medium transition-colors",
              tab === tabKey
                ? "border-salon-gold text-salon-black"
                : "border-transparent text-salon-muted",
            )}
          >
            {t(`tab_${tabKey}`)}
          </button>
        ))}
      </div>

      {tab === "sales" ? (
        <ReportList
          empty={t("noData")}
          rows={data.salesByEmployee.map((row) => ({
            id: row.employeeId,
            title: row.employeeName,
            subtitle: t("salesCount", { count: row.saleCount }),
            amount: formatOMR(row.revenueTotal, locale),
          }))}
        />
      ) : null}

      {tab === "revenue" ? (
        <div className="flex flex-col gap-3">
          <SummaryCard label={t("totalRevenue")} value={formatOMR(data.revenueTotal, locale)} />
          <SummaryCard label={t("saleCount")} value={String(data.saleCount)} highlight={false} />
          <SummaryCard label={t("totalExpenses")} value={formatOMR(data.expensesTotal, locale)} />
          <SummaryCard
            label={t("netRevenue")}
            value={formatOMR(netRevenue, locale)}
            highlight={netRevenue >= 0}
          />
        </div>
      ) : null}

      {tab === "expenses" ? (
        <ReportList
          empty={t("noData")}
          rows={data.expensesByCategory.map((row) => ({
            id: row.category,
            title: expenseCategoryLabel(row.category),
            subtitle: t("expenseCount", { count: row.count }),
            amount: formatOMR(row.total, locale),
          }))}
        />
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-salon-gold bg-salon-gold/15 text-salon-black"
          : "border-salon-border bg-white text-salon-muted",
      )}
    >
      {label}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  highlight = true,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-salon-border bg-white p-5 shadow-sm">
      <p className="text-sm text-salon-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-2xl font-bold",
          highlight ? "text-salon-gold" : "text-salon-black",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ReportList({
  rows,
  empty,
}: {
  rows: { id: string; title: string; subtitle: string; amount: string }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-salon-muted">{empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-salon-border bg-white px-4 py-3"
        >
          <div>
            <p className="font-medium text-salon-black">{row.title}</p>
            <p className="text-xs text-salon-muted">{row.subtitle}</p>
          </div>
          <p className="font-semibold text-salon-gold">{row.amount}</p>
        </li>
      ))}
    </ul>
  );
}

const dateInputClass = cn(
  "min-h-11 rounded-xl border border-salon-border bg-white px-3 text-salon-black outline-none focus-visible:border-salon-gold",
);
