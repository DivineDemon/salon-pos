"use client";

import { Delete } from "lucide-react";
import { useTranslations } from "next-intl";
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

type PinPadProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  className?: string;
};

const PIN_SLOTS = ["s0", "s1", "s2", "s3", "s4", "s5"] as const;

export function PinPad({ value, onChange, onSubmit, disabled, className }: PinPadProps) {
  const t = useTranslations("auth");

  function appendDigit(digit: string) {
    if (disabled || value.length >= PIN_MAX_LENGTH) return;
    onChange(`${value}${digit}`);
  }

  function backspace() {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  }

  function handleSubmit() {
    if (disabled || value.length < PIN_MIN_LENGTH) return;
    onSubmit();
  }

  return (
    <div className={cn("flex w-full max-w-xs flex-col gap-5", className)}>
      <div className="flex flex-col items-center gap-3 rounded-[20px] bg-salon-surface-dark px-6 py-6">
        <p className="text-sm font-medium text-salon-gold-light">{t("enterPin")}</p>
        <div className="flex gap-3" aria-hidden="true">
          {PIN_SLOTS.slice(0, PIN_MAX_LENGTH).map((slot, index) => (
            <span
              key={slot}
              className={cn(
                "size-3.5 rounded-full border transition-colors",
                index < value.length
                  ? "border-salon-gold-light bg-salon-gold-light"
                  : "border-[#4A4A4A] bg-[#3A3A3A]",
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <PinButton key={digit} onClick={() => appendDigit(digit)} disabled={disabled}>
            {digit}
          </PinButton>
        ))}
        <PinButton
          onClick={backspace}
          disabled={disabled || value.length === 0}
          aria-label={t("backspace")}
        >
          <Delete className="size-5" />
        </PinButton>
        <PinButton onClick={() => appendDigit("0")} disabled={disabled}>
          0
        </PinButton>
        <PinButton
          onClick={handleSubmit}
          disabled={disabled || value.length < PIN_MIN_LENGTH}
          className="bg-salon-gold text-salon-black hover:bg-salon-gold-light"
        >
          {t("go")}
        </PinButton>
      </div>
    </div>
  );
}

function PinButton({
  children,
  className,
  ...props
}: React.ComponentProps<"button"> & { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-touch items-center justify-center rounded-[20px] bg-[#2A2A2A] text-xl font-semibold text-white transition-colors hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
