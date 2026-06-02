import { setRequestLocale } from "next-intl/server";
import { SaleWizard } from "@/components/employee/sale-wizard";
import { getServiceCatalog } from "@/lib/employee/catalog";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const catalog = await getServiceCatalog();

  return <SaleWizard catalog={catalog} />;
}
