import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  currentStep: 1 | 2 | 3;
  className?: string;
};

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={cn(
            "h-1 flex-1 rounded-sm",
            step <= currentStep ? "bg-salon-gold" : "bg-salon-border",
          )}
        />
      ))}
    </div>
  );
}
