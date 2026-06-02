import { BackButton } from "@/components/employee/back-button";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  backHref?: string;
  className?: string;
};

export function PageHeader({ title, subtitle, backHref, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center gap-3 px-5 pb-5 pt-2", className)}>
      <BackButton href={backHref ?? "/home"} />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-[22px] font-bold text-salon-black">{title}</h1>
        <p className="text-sm text-salon-muted">{subtitle}</p>
      </div>
    </header>
  );
}
