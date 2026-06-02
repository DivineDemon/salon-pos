"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/intl/navigation";
import type { Locale } from "@/intl/routing";
import { createService, translateAdminError, updateService } from "@/lib/admin/actions";
import type { AdminService, AdminServiceCategory } from "@/lib/admin/queries";
import { formatOMR, parseOMR } from "@/lib/currency";
import type { PriceTier } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type ServiceManagerProps = {
  categories: AdminServiceCategory[];
  servicesByCategory: Record<string, AdminService[]>;
  locale: Locale;
};

type FormMode =
  | { type: "closed" }
  | { type: "create"; categoryId: string }
  | { type: "edit"; service: AdminService };

type OpenFormMode = Exclude<FormMode, { type: "closed" }>;

export function ServiceManager({ categories, servicesByCategory, locale }: ServiceManagerProps) {
  const t = useTranslations("admin.services");
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(categories.slice(0, 3).map((c) => c.id)),
  );
  const [mode, setMode] = useState<FormMode>({ type: "closed" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const categoryName = (cat: AdminServiceCategory) => (locale === "ar" ? cat.nameAr : cat.nameEn);

  const serviceName = (svc: AdminService) => (locale === "ar" ? svc.nameAr : svc.nameEn);

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-8">
      {categories.map((category) => {
        const services = servicesByCategory[category.id] ?? [];
        const isOpen = openCategories.has(category.id);

        return (
          <section
            key={category.id}
            className="overflow-hidden rounded-2xl border border-salon-border bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="flex w-full min-h-14 items-center justify-between gap-3 px-4 py-3 text-start"
            >
              <span className="font-semibold text-salon-black">{categoryName(category)}</span>
              <span className="text-sm text-salon-muted">
                {services.length} {t("serviceCount")}
              </span>
            </button>

            {isOpen ? (
              <ul className="border-t border-salon-border">
                {services.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-center justify-between gap-3 border-b border-salon-border/60 px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          service.isActive ? "text-salon-black" : "text-salon-muted line-through",
                        )}
                      >
                        {serviceName(service)}
                      </p>
                      <p className="mt-0.5 text-xs text-salon-gold">
                        {service.priceTiers
                          .map((tier) => formatOMR(tier.amount, locale))
                          .join(" · ")}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMode({ type: "edit", service })}
                    >
                      {t("edit")}
                    </Button>
                  </li>
                ))}
                <li className="px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setMode({ type: "create", categoryId: category.id })}
                  >
                    <Plus className="size-4" aria-hidden />
                    {t("addService")}
                  </Button>
                </li>
              </ul>
            ) : null}
          </section>
        );
      })}

      {mode.type !== "closed" ? (
        <ServiceFormSheet
          mode={mode}
          categories={categories}
          pending={pending}
          error={error}
          onClose={() => {
            setMode({ type: "closed" });
            setError(null);
          }}
          onSubmit={(values) => {
            setError(null);
            startTransition(async () => {
              const result =
                mode.type === "create"
                  ? await createService(values)
                  : await updateService(mode.service.id, values);

              if (!result.ok) {
                setError(await translateAdminError(result.error));
                return;
              }

              setMode({ type: "closed" });
              router.refresh();
            });
          }}
        />
      ) : null}
    </div>
  );
}

type ServiceFormValues = {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  priceTiers: PriceTier[];
  isActive: boolean;
};

type EditablePriceTier = PriceTier & { key: string };

function createEditableTier(tier: PriceTier = { label: "Standard", amount: 0 }): EditablePriceTier {
  return { ...tier, key: crypto.randomUUID() };
}

function ServiceFormSheet({
  mode,
  categories,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  mode: OpenFormMode;
  categories: AdminServiceCategory[];
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void;
}) {
  const t = useTranslations("admin.services");
  const isEdit = mode.type === "edit";

  const [values, setValues] = useState<
    Omit<ServiceFormValues, "priceTiers"> & { priceTiers: EditablePriceTier[] }
  >(() => {
    if (mode.type === "edit") {
      return {
        categoryId: mode.service.categoryId,
        nameEn: mode.service.nameEn,
        nameAr: mode.service.nameAr,
        priceTiers: mode.service.priceTiers.length
          ? mode.service.priceTiers.map((tier) => createEditableTier(tier))
          : [createEditableTier()],
        isActive: mode.service.isActive,
      };
    }
    return {
      categoryId: mode.categoryId,
      nameEn: "",
      nameAr: "",
      priceTiers: [createEditableTier()],
      isActive: true,
    };
  });

  function updateTier(key: string, patch: Partial<PriceTier>) {
    setValues((v) => ({
      ...v,
      priceTiers: v.priceTiers.map((tier) => (tier.key === key ? { ...tier, ...patch } : tier)),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <h2 className="font-display text-xl font-bold text-salon-black">
          {isEdit ? t("editService") : t("addService")}
        </h2>

        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...values,
              priceTiers: values.priceTiers.map(({ label, amount }) => ({
                label,
                amount: parseOMR(String(amount)),
              })),
            });
          }}
        >
          <Field label={t("category")}>
            <select
              className={inputClass}
              value={values.categoryId}
              onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value }))}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("nameEn")}>
            <input
              className={inputClass}
              value={values.nameEn}
              onChange={(e) => setValues((v) => ({ ...v, nameEn: e.target.value }))}
              required
            />
          </Field>
          <Field label={t("nameAr")}>
            <input
              className={inputClass}
              dir="rtl"
              value={values.nameAr}
              onChange={(e) => setValues((v) => ({ ...v, nameAr: e.target.value }))}
              required
            />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-salon-black">{t("priceTiers")}</span>
            {values.priceTiers.map((tier) => (
              <div key={tier.key} className="flex gap-2">
                <input
                  className={cn(inputClass, "flex-1")}
                  placeholder={t("tierLabel")}
                  value={tier.label}
                  onChange={(e) => updateTier(tier.key, { label: e.target.value })}
                />
                <input
                  className={cn(inputClass, "w-28")}
                  inputMode="decimal"
                  value={String(tier.amount)}
                  onChange={(e) =>
                    updateTier(tier.key, { amount: parseOMR(e.target.value) as unknown as number })
                  }
                />
                {values.priceTiers.length > 1 ? (
                  <button
                    type="button"
                    aria-label={t("removeTier")}
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-salon-border"
                    onClick={() =>
                      setValues((v) => ({
                        ...v,
                        priceTiers: v.priceTiers.filter((t) => t.key !== tier.key),
                      }))
                    }
                  >
                    <Trash2 className="size-4 text-salon-muted" />
                  </button>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValues((v) => ({
                  ...v,
                  priceTiers: [...v.priceTiers, createEditableTier({ label: "", amount: 0 })],
                }))
              }
            >
              {t("addTier")}
            </Button>
          </div>

          {isEdit ? (
            <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-salon-border px-4">
              <span className="text-sm font-medium text-salon-black">{t("active")}</span>
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => setValues((v) => ({ ...v, isActive: e.target.checked }))}
                className="size-5 accent-salon-gold"
              />
            </label>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="min-h-12 flex-1" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="min-h-12 flex-1 bg-salon-gold text-salon-black hover:bg-salon-gold/90"
            >
              {pending ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-salon-black">{label}</span>
      {children}
    </div>
  );
}

const inputClass = cn(
  "min-h-12 w-full rounded-xl border border-salon-border bg-white px-4 text-base text-salon-black outline-none focus-visible:border-salon-gold focus-visible:ring-2 focus-visible:ring-salon-gold/30",
);
