"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/intl/navigation";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
};

export function BackButton({ href, onClick, className, label }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (onClick) {
      onClick();
      return;
    }
    if (href) {
      router.push(href);
      return;
    }
    router.back();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-xl border border-salon-border bg-white",
        className,
      )}
    >
      <ChevronLeft className="size-5 text-salon-black rtl:rotate-180" aria-hidden />
    </button>
  );
}
