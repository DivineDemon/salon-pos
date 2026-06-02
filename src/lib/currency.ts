import type { Locale } from "@/intl/routing";

const localeMap: Record<Locale, "en-OM" | "ar-OM"> = {
  en: "en-OM",
  ar: "ar-OM",
};

export function formatOMR(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "OMR",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount);
}

export function parseOMR(value: string): number {
  const normalized = value.replace(/[^\d.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}
