import { ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/intl/navigation";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");

  const cards = [
    { href: "/admin/branches" as const, title: t("navBranches"), subtitle: t("navBranchesAr") },
    { href: "/admin/employees" as const, title: t("navEmployees"), subtitle: t("navEmployeesAr") },
    { href: "/admin/services" as const, title: t("navServices"), subtitle: t("navServicesAr") },
    { href: "/admin/reports" as const, title: t("navReports"), subtitle: t("navReportsAr") },
  ];

  return (
    <main className="flex min-h-dvh flex-col px-6 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-salon-black">{t("homeTitle")}</h1>
          <p className="mt-1 text-sm text-salon-muted">{t("homeSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              "flex min-h-36 flex-col justify-between rounded-2xl border border-salon-border bg-white p-6 shadow-sm transition-opacity hover:opacity-95 active:opacity-90",
            )}
          >
            <ChevronRight className="size-5 self-end text-salon-muted rtl:rotate-180" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold text-salon-black">{card.title}</h2>
              <p className="mt-1 text-sm text-salon-muted">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
