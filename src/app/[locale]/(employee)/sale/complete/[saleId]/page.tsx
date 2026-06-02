import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SaleComplete } from "@/components/employee/sale-complete";
import { getSaleReceipt } from "@/lib/employee/actions";

type Props = {
  params: Promise<{ locale: string; saleId: string }>;
};

export default async function SaleCompletePage({ params }: Props) {
  const { locale, saleId } = await params;
  setRequestLocale(locale);

  const receipt = await getSaleReceipt(saleId);
  if (!receipt) {
    notFound();
  }

  return <SaleComplete receipt={receipt} />;
}
