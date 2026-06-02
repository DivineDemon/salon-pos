import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getDb } from "@/lib/db";
import { branches, employees, type PriceTier, serviceCategories, services } from "@/lib/db/schema";

export type AdminBranch = {
  id: string;
  nameEn: string;
  nameAr: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
};

export type AdminEmployee = {
  id: string;
  name: string;
  branchId: string;
  branchNameEn: string;
  branchNameAr: string;
  authType: "pin" | "password";
  username: string | null;
  role: "employee" | "admin";
  isActive: boolean;
};

export type AdminServiceCategory = {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
};

export type AdminService = {
  id: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  priceTiers: PriceTier[];
  isActive: boolean;
};

export async function listAdminBranches(): Promise<AdminBranch[] | null> {
  if (!(await requireAdmin())) return null;

  const db = getDb();
  return db
    .select({
      id: branches.id,
      nameEn: branches.nameEn,
      nameAr: branches.nameAr,
      address: branches.address,
      phone: branches.phone,
      isActive: branches.isActive,
    })
    .from(branches)
    .orderBy(asc(branches.nameEn));
}

export async function listAdminEmployees(): Promise<AdminEmployee[] | null> {
  if (!(await requireAdmin())) return null;

  const db = getDb();
  const rows = await db
    .select({
      id: employees.id,
      name: employees.name,
      branchId: employees.branchId,
      branchNameEn: branches.nameEn,
      branchNameAr: branches.nameAr,
      authType: employees.authType,
      username: employees.username,
      role: employees.role,
      isActive: employees.isActive,
    })
    .from(employees)
    .innerJoin(branches, eq(employees.branchId, branches.id))
    .orderBy(asc(branches.nameEn), asc(employees.name));

  return rows;
}

export async function listAdminServiceCatalog(): Promise<{
  categories: AdminServiceCategory[];
  servicesByCategory: Record<string, AdminService[]>;
} | null> {
  if (!(await requireAdmin())) return null;

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
      isActive: services.isActive,
    })
    .from(services)
    .orderBy(asc(services.nameEn));

  const servicesByCategory: Record<string, AdminService[]> = {};
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
      isActive: service.isActive,
    });
  }

  return { categories, servicesByCategory };
}

export async function listActiveBranchesForSelect(): Promise<AdminBranch[] | null> {
  if (!(await requireAdmin())) return null;

  const db = getDb();
  return db
    .select({
      id: branches.id,
      nameEn: branches.nameEn,
      nameAr: branches.nameAr,
      address: branches.address,
      phone: branches.phone,
      isActive: branches.isActive,
    })
    .from(branches)
    .where(eq(branches.isActive, true))
    .orderBy(asc(branches.nameEn));
}
