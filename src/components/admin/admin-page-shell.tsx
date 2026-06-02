import type { ReactNode } from "react";
import { BackButton } from "@/components/employee/back-button";
import { cn } from "@/lib/utils";

type AdminPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
};

export function AdminPageShell({ title, subtitle, children, className }: AdminPageShellProps) {
  return (
    <main className={cn("flex min-h-0 flex-1 flex-col px-6 py-8", className)}>
      <header className="mb-6 flex items-center gap-3">
        <BackButton href="/admin" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-salon-black">{title}</h1>
          <p className="mt-0.5 text-sm text-salon-muted">{subtitle}</p>
        </div>
      </header>
      {children}
    </main>
  );
}
