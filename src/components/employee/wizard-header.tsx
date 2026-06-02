import { BackButton } from "@/components/employee/back-button";
import { StepIndicator } from "@/components/employee/step-indicator";
import { cn } from "@/lib/utils";

type WizardHeaderProps = {
  title: string;
  subtitle: string;
  step: 1 | 2 | 3;
  onBack?: () => void;
  backHref?: string;
  className?: string;
};

export function WizardHeader({
  title,
  subtitle,
  step,
  onBack,
  backHref,
  className,
}: WizardHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3 px-5 pb-3 pt-2", className)}>
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} href={backHref} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-bold text-salon-black">{title}</h1>
          <p className="text-xs text-salon-muted">{subtitle}</p>
        </div>
      </div>
      <StepIndicator currentStep={step} />
    </header>
  );
}
