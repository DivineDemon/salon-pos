import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { PriceTier } from "@/lib/db/schema";
import { serviceCategories, services } from "@/lib/db/schema";

export type CatalogCategory = {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
};

export type CatalogService = {
  id: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  priceTiers: PriceTier[];
};

export type ServiceCatalog = {
  categories: CatalogCategory[];
  servicesByCategory: Record<string, CatalogService[]>;
};

export async function getServiceCatalog(): Promise<ServiceCatalog> {
  const db = getDb();

  const categories = await db
    .select({
      id: serviceCategories.id,
      nameEn: serviceCategories.nameEn,
      nameAr: serviceCategories.nameAr,
      sortOrder: serviceCategories.sortOrder,
    })
    .from(serviceCategories)
    .orderBy(asc(serviceCategories.sortOrder));

  const allServices = await db
    .select({
      id: services.id,
      categoryId: services.categoryId,
      nameEn: services.nameEn,
      nameAr: services.nameAr,
      priceTiers: services.priceTiers,
    })
    .from(services)
    .where(eq(services.isActive, true));

  const servicesByCategory: Record<string, CatalogService[]> = {};
  for (const category of categories) {
    servicesByCategory[category.id] = [];
  }

  for (const service of allServices) {
    const list = servicesByCategory[service.categoryId];
    if (!list) continue;
    list.push({
      id: service.id,
      categoryId: service.categoryId,
      nameEn: service.nameEn,
      nameAr: service.nameAr,
      priceTiers: service.priceTiers ?? [],
    });
  }

  return { categories, servicesByCategory };
}
