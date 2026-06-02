"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/intl/navigation";
import { type Locale, routing } from "@/intl/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ar: "عر",
};

const localeAriaLabels: Record<Locale, "english" | "arabic"> = {
  en: "english",
  ar: "arabic",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function setLocale(next: Locale) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={cn("inline-flex rounded-lg border border-salon-border", className)}
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          type="button"
          variant={locale === loc ? "default" : "ghost"}
          size="icon"
          className={cn(
            "text-xs",
            locale === loc && "bg-salon-gold text-salon-black hover:bg-salon-gold-light",
          )}
          onClick={() => setLocale(loc)}
          aria-pressed={locale === loc}
          aria-label={t(localeAriaLabels[loc])}
        >
          {localeLabels[loc]}
        </Button>
      ))}
    </div>
  );
}
