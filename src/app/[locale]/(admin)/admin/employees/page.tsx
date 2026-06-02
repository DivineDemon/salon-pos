import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { EmployeeManager } from "@/components/admin/employee-manager";
import { redirect } from "@/intl/navigation";
import { listActiveBranchesForSelect, listAdminEmployees } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEmployeesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.employees");
  const [employees, branches] = await Promise.all([
    listAdminEmployees(),
    listActiveBranchesForSelect(),
  ]);

  if (!employees || !branches) {
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <AdminPageShell title={t("title")} subtitle={t("subtitle")}>
      <EmployeeManager employees={employees} branches={branches} locale={locale} />
    </AdminPageShell>
  );
}
