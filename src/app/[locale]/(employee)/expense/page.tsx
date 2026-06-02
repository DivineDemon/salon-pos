import { setRequestLocale } from "next-intl/server";
import { ExpenseForm } from "@/components/employee/expense-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ExpensePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExpenseForm />;
}
