import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/intl/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EmployeeLoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  redirect({ href: "/", locale });
}
