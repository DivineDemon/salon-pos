import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { type ReportRange, ReportsPanel, type ReportTab } from "@/components/admin/reports-panel";
import { redirect } from "@/intl/navigation";
import type { Locale } from "@/intl/routing";
import { listActiveBranchesForSelect } from "@/lib/admin/queries";
import { getReportData } from "@/lib/admin/reports";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    branch?: string;
    range?: string;
    from?: string;
    to?: string;
    tab?: string;
  }>;
};

function parseRange(value: string | undefined): ReportRange {
  if (value === "week" || value === "custom") return value;
  return "today";
}

function parseTab(value: string | undefined): ReportTab {
  if (value === "revenue" || value === "expenses") return value;
  return "sales";
}

export default async function AdminReportsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("admin.reports");
  const range = parseRange(query.range);
  const tab = parseTab(query.tab);
  const branchId = query.branch?.trim() || null;
  const customFrom = query.from ?? "";
  const customTo = query.to ?? "";

  const [branches, data] = await Promise.all([
    listActiveBranchesForSelect(),
    getReportData({
      branchId,
      range,
      customFrom: customFrom || undefined,
      customTo: customTo || undefined,
    }),
  ]);

  if (!branches || !data) {
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <AdminPageShell title={t("title")} subtitle={t("subtitle")}>
      <ReportsPanel
        branches={branches}
        data={data}
        locale={locale as Locale}
        branchId={branchId}
        range={range}
        customFrom={customFrom}
        customTo={customTo}
        tab={tab}
      />
    </AdminPageShell>
  );
}
