import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from "@/lib/auth/constants";
import type { PriceTier } from "@/lib/db/schema";

export function validatePin(pin: string): boolean {
  return /^\d+$/.test(pin) && pin.length >= PIN_MIN_LENGTH && pin.length <= PIN_MAX_LENGTH;
}

export function validatePriceTiers(tiers: PriceTier[]): boolean {
  if (tiers.length === 0) return false;
  return tiers.every(
    (tier) =>
      tier.label.trim().length > 0 &&
      Number.isFinite(tier.amount) &&
      tier.amount > 0 &&
      Math.round(tier.amount * 1000) === tier.amount * 1000,
  );
}

export function normalizePriceTiers(tiers: PriceTier[]): PriceTier[] {
  return tiers.map((tier) => ({
    label: tier.label.trim(),
    amount: Math.round(tier.amount * 1000) / 1000,
  }));
}
