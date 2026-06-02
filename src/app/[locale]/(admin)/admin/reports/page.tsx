import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ReportsPanel, type ReportTab } from "@/components/admin/reports-panel";
import { redirect } from "@/intl/navigation";
import type { Locale } from "@/intl/routing";
import { listActiveBranchesForSelect } from "@/lib/admin/queries";
import { getReportData } from "@/lib/admin/reports";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    branch?: string;
    from?: string;
    to?: string;
    tab?: string;
  }>;
};

function parseTab(value: string | undefined): ReportTab {
  if (value === "revenue" || value === "expenses") return value;
  return "sales";
}

export default async function AdminReportsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations("admin.reports");
  const tab = parseTab(query.tab);
  const branchId = query.branch?.trim() || null;
  const from = query.from ?? "";
  const to = query.to ?? "";

  const [branches, data] = await Promise.all([
    listActiveBranchesForSelect(),
    getReportData({
      branchId,
      from: from || undefined,
      to: to || undefined,
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
        from={from}
        to={to}
        tab={tab}
      />
    </AdminPageShell>
  );
}
