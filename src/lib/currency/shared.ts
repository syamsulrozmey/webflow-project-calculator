import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/calculator/from-answers";

export const DEFAULT_FX_RATES: Record<SupportedCurrency, number> = {
  usd: 1,
  eur: 0.93,
  gbp: 0.79,
};

export interface CurrencyRatesSnapshot {
  base: SupportedCurrency;
  rates: Record<SupportedCurrency, number>;
  fetchedAt: number;
  source: "live" | "cache" | "static";
  stale?: boolean;
}

export function convertAmount(
  value: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  snapshot: CurrencyRatesSnapshot,
  precision: number = 2,
): number {
  if (!Number.isFinite(value) || from === to) {
    return roundCurrency(value, precision);
  }
  const rates = ensureRates(snapshot);
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) {
    return roundCurrency(value, precision);
  }
  const factor = toRate / fromRate;
  return roundCurrency(value * factor, precision);
}

export function ensureRates(snapshot: CurrencyRatesSnapshot): Record<SupportedCurrency, number> {
  const result = { ...DEFAULT_FX_RATES, ...snapshot.rates };
  result[snapshot.base] = 1;
  SUPPORTED_CURRENCIES.forEach((currency) => {
    if (!result[currency]) {
      result[currency] = DEFAULT_FX_RATES[currency];
    }
  });
  return result;
}

export function roundCurrency(value: number, precision: number = 2): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

