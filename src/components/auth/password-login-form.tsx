"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PasswordLoginFormProps = {
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
};

export function PasswordLoginForm({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  disabled,
  className,
}: PasswordLoginFormProps) {
  const t = useTranslations("auth");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex w-full max-w-sm flex-col gap-4", className)}>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-salon-black">{t("username")}</span>
        <span className="text-xs text-salon-muted">{t("usernameAr")}</span>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          disabled={disabled}
          className="min-h-touch rounded-xl border border-salon-border bg-white px-4 text-base text-salon-black outline-none focus:border-salon-gold focus:ring-2 focus:ring-salon-gold/30"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-salon-black">{t("password")}</span>
        <span className="text-xs text-salon-muted">{t("passwordAr")}</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          disabled={disabled}
          className="min-h-touch rounded-xl border border-salon-border bg-white px-4 text-base text-salon-black outline-none focus:border-salon-gold focus:ring-2 focus:ring-salon-gold/30"
        />
      </label>

      <Button
        type="submit"
        disabled={disabled || !username.trim() || !password}
        className="min-h-touch w-full bg-salon-gold text-base font-bold text-salon-black hover:bg-salon-gold-light"
      >
        {t("signIn")}
      </Button>
    </form>
  );
}
