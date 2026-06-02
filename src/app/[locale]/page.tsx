import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const common = await getTranslations("common");

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-8 px-6 py-12">
      <header className="flex w-full flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-salon-muted">
          {common("appName")}
        </p>
        <h1 className="font-display text-3xl font-semibold text-salon-black sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-sm text-salon-muted">{t("subtitle")}</p>
      </header>
      <LanguageSwitcher />
    </main>
  );
}
