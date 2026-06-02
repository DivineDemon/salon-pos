import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { ServiceManager } from "@/components/admin/service-manager";
import { redirect } from "@/intl/navigation";
import type { Locale } from "@/intl/routing";
import { listAdminServiceCatalog } from "@/lib/admin/queries";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin.services");
  const catalog = await listAdminServiceCatalog();

  if (!catalog) {
    redirect({ href: "/admin/login", locale });
    return null;
  }

  return (
    <AdminPageShell title={t("title")} subtitle={t("subtitle")}>
      <ServiceManager
        categories={catalog.categories}
        servicesByCategory={catalog.servicesByCategory}
        locale={locale as Locale}
      />
    </AdminPageShell>
  );
}
