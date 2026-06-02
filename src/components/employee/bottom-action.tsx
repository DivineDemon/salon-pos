import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BottomActionProps = {
  label: string;
  hint?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

export function BottomAction({
  label,
  hint,
  onClick,
  type = "button",
  disabled,
  loading,
  className,
}: BottomActionProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 border-t border-salon-border/60 bg-background px-6 py-4 pb-8",
        className,
      )}
    >
      <Button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className="min-h-14 w-full rounded-[14px] text-[17px] font-bold"
      >
        {loading ? "…" : label}
      </Button>
      {hint ? <p className="mt-2 text-center text-sm text-salon-muted">{hint}</p> : null}
    </div>
  );
}
