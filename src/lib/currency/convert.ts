import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import type { CalculationResult, LineItem } from "@/lib/calculator/types";
import type { RetainerPackage } from "@/lib/calculator/retainer";
import {
  DEFAULT_FX_RATES,
  convertAmount,
  type CurrencyRatesSnapshot,
} from "@/lib/currency/shared";

const STATIC_SNAPSHOT: CurrencyRatesSnapshot = {
  base: "usd",
  rates: { ...DEFAULT_FX_RATES },
  fetchedAt: 0,
  source: "static",
  stale: true,
};

export function convertCalculationResult(
  result: CalculationResult,
  from: SupportedCurrency,
  to: SupportedCurrency,
  snapshot?: CurrencyRatesSnapshot | null,
): CalculationResult {
  if (from === to) {
    return result;
  }
  const fxSnapshot = snapshot ?? STATIC_SNAPSHOT;
  const convertValue = (value: number) => convertAmount(value, from, to, fxSnapshot);
  return {
    ...result,
    totalCost: convertValue(result.totalCost),
    maintenanceCost: convertValue(result.maintenanceCost),
    effectiveHourlyRate: convertValue(result.effectiveHourlyRate),
    bufferCost: convertValue(result.bufferCost),
    lineItems: convertLineItems(result.lineItems, convertValue),
    addons: result.addons.map((addon) => ({
      ...addon,
      cost: convertValue(addon.cost),
    })),
    retainers: convertRetainers(result.retainers, convertValue),
    deterministicTotals: result.deterministicTotals
      ? {
          totalCost: convertValue(result.deterministicTotals.totalCost),
          totalHours: result.deterministicTotals.totalHours,
        }
      : undefined,
  };
}

function convertLineItems(items: LineItem[], convertValue: (value: number) => number): LineItem[] {
  return items.map((item) => ({
    ...item,
    cost: convertValue(item.cost),
  }));
}

function convertRetainers(
  retainers: RetainerPackage[],
  convertValue: (value: number) => number,
): RetainerPackage[] {
  return retainers.map((pkg) => ({
    ...pkg,
    monthlyFee: convertValue(pkg.monthlyFee),
  }));
}

