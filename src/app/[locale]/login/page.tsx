import { setRequestLocale } from "next-intl/server";
import { LoginScreen } from "@/components/auth/login-screen";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EmployeeLoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginScreen scope="employee" />;
}
