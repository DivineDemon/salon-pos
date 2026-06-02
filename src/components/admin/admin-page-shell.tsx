import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { BackButton } from "@/components/employee/back-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

type AdminPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function AdminPageShell({ title, subtitle, children, className }: AdminPageShellProps) {
  return (
    <main className={cn("flex min-h-dvh flex-col px-6 py-8", className)}>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <BackButton href="/admin" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold text-salon-black">{title}</h1>
            <p className="mt-0.5 text-sm text-salon-muted">{subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
