"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { PasswordLoginForm } from "@/components/auth/password-login-form";
import { PinPad } from "@/components/auth/pin-pad";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useRouter } from "@/intl/navigation";
import { cn } from "@/lib/utils";

type LoginScope = "employee" | "admin";

type LoginScreenProps = {
  scope: LoginScope;
  className?: string;
};

type LoginMode = "pin" | "password";

export function LoginScreen({ scope, className }: LoginScreenProps) {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("pin");
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitCredentials(body: Record<string, string>) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, scope }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(data.error ?? t("loginFailed"));
        return;
      }

      router.replace(data.redirectTo ?? (scope === "admin" ? "/admin" : "/home"));
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  function handlePinSubmit() {
    submitCredentials({ pin });
  }

  function handlePasswordSubmit() {
    submitCredentials({ username, password });
  }

  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 py-8",
        scope === "admin" ? "max-w-[960px]" : "max-w-[720px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex w-full justify-end">
          <LanguageSwitcher />
        </div>

        <header className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-salon-muted">
            {common("appName")}
          </p>
          <h1 className="font-display text-3xl font-bold text-salon-black">
            {scope === "admin" ? t("adminTitle") : t("title")}
          </h1>
          <p className="text-sm text-salon-muted">
            {scope === "admin" ? t("adminSubtitle") : t("subtitle")}
          </p>
        </header>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8">
        {error ? (
          <p
            role="alert"
            className="w-full max-w-sm rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        {mode === "pin" ? (
          <PinPad value={pin} onChange={setPin} onSubmit={handlePinSubmit} disabled={loading} />
        ) : (
          <PasswordLoginForm
            username={username}
            password={password}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handlePasswordSubmit}
            disabled={loading}
          />
        )}
      </div>

      <footer className="flex flex-col items-center gap-1 pb-8 text-center">
        {mode === "pin" ? (
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError(null);
            }}
            className="text-base font-medium text-salon-gold hover:text-salon-gold-light"
          >
            {t("loginWithUsername")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("pin");
              setError(null);
            }}
            className="text-base font-medium text-salon-gold hover:text-salon-gold-light"
          >
            {t("loginWithPin")}
          </button>
        )}
        <p className="text-sm text-salon-muted">
          {mode === "pin" ? t("loginWithUsernameAr") : t("loginWithPinAr")}
        </p>
      </footer>
    </main>
  );
}
