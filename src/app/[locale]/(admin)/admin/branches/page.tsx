import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { BranchManager } from "@/components/admin/branch-manager";
import { redirect } from "@/intl/navigation";
import { listAdminBranches } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBranchesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.branches");
  const branches = await listAdminBranches();

  if (!branches) {
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <AdminPageShell title={t("title")} subtitle={t("subtitle")}>
      <BranchManager branches={branches} locale={locale} />
    </AdminPageShell>
  );
}
