"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/intl/navigation";
import { type Locale, routing } from "@/intl/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function setLocale(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={cn("inline-flex rounded-lg border border-salon-border p-1", className)}
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          type="button"
          variant={locale === loc ? "default" : "ghost"}
          size="sm"
          className={cn(
            "min-h-touch px-3",
            locale === loc && "bg-salon-gold text-salon-black hover:bg-salon-gold-light",
          )}
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
        >
          {loc === "en" ? t("english") : t("arabic")}
        </Button>
      ))}
    </div>
  );
}
