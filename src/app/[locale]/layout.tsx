import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppNavbar } from "@/components/app-navbar";
import { type Locale, routing } from "@/intl/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir} className="flex min-h-dvh flex-col">
      <NextIntlClientProvider messages={messages}>
        <AppNavbar />
        <div className="flex flex-1 flex-col">{children}</div>
      </NextIntlClientProvider>
    </div>
  );
}
