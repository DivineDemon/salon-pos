import { getTranslations } from "next-intl/server";
import { LogoutButton } from "@/components/auth/logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getSession } from "@/lib/auth/session";

export async function AppNavbar() {
  const session = await getSession();
  const common = await getTranslations("common");

  return (
    <header className="sticky top-0 z-50 border-b border-salon-border bg-salon-cream/95 backdrop-blur supports-backdrop-filter:bg-salon-cream/80">
      <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-4 px-4 sm:px-6">
        <p className="truncate text-sm font-medium uppercase tracking-widest text-salon-muted">
          {common("appName")}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          {session ? <LogoutButton /> : null}
        </div>
      </div>
    </header>
  );
}
