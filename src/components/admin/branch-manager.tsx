"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/intl/navigation";
import { createBranch, translateAdminError, updateBranch } from "@/lib/admin/actions";
import type { AdminBranch } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

type BranchManagerProps = {
  branches: AdminBranch[];
  locale: string;
};

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; branch: AdminBranch };

export function BranchManager({ branches, locale }: BranchManagerProps) {
  const t = useTranslations("admin.branches");
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>({ type: "closed" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displayName = (branch: AdminBranch) => (locale === "ar" ? branch.nameAr : branch.nameEn);

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        className="min-h-12 w-full bg-salon-black text-salon-cream hover:bg-salon-black/90"
        onClick={() => setMode({ type: "create" })}
      >
        {t("addBranch")}
      </Button>

      <ul className="flex flex-col gap-3">
        {branches.map((branch) => (
          <li
            key={branch.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-salon-border bg-white p-4 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-salon-black">{displayName(branch)}</p>
              {branch.phone ? (
                <p className="mt-0.5 text-sm text-salon-muted">{branch.phone}</p>
              ) : null}
              {!branch.isActive ? (
                <span className="mt-1 inline-block rounded-full bg-salon-muted/15 px-2 py-0.5 text-xs font-medium text-salon-muted">
                  {t("inactive")}
                </span>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode({ type: "edit", branch })}
            >
              {t("edit")}
            </Button>
          </li>
        ))}
      </ul>

      {mode.type !== "closed" ? (
        <BranchFormSheet
          mode={mode}
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
                  ? await createBranch(values)
                  : await updateBranch(mode.branch.id, { ...values, isActive: values.isActive });

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

type BranchFormValues = {
  nameEn: string;
  nameAr: string;
  address: string;
  phone: string;
  isActive: boolean;
};

function BranchFormSheet({
  mode,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  mode: FormMode;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: BranchFormValues) => void;
}) {
  const t = useTranslations("admin.branches");
  const isEdit = mode.type === "edit";
  const initial = isEdit
    ? {
        nameEn: mode.branch.nameEn,
        nameAr: mode.branch.nameAr,
        address: mode.branch.address ?? "",
        phone: mode.branch.phone ?? "",
        isActive: mode.branch.isActive,
      }
    : { nameEn: "", nameAr: "", address: "", phone: "", isActive: true };

  const [values, setValues] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <h2 className="font-display text-xl font-bold text-salon-black">
          {isEdit ? t("editBranch") : t("addBranch")}
        </h2>

        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              nameEn: values.nameEn,
              nameAr: values.nameAr,
              address: values.address,
              phone: values.phone,
              isActive: values.isActive,
            });
          }}
        >
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
          <Field label={t("address")}>
            <input
              className={inputClass}
              value={values.address}
              onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            />
          </Field>
          <Field label={t("phone")}>
            <input
              className={inputClass}
              type="tel"
              value={values.phone}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
            />
          </Field>

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
