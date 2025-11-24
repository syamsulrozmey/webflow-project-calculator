import type { CalculationInput } from "@/lib/calculator/types";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import { cacheGet, cacheSet } from "@/lib/cache";
import { DEFAULT_FX_RATES, convertAmount, type CurrencyRatesSnapshot } from "@/lib/currency/shared";

const FX_CACHE_KEY = "fx:latest";
const FX_CACHE_TTL_SECONDS = 60 * 30; // 30 minutes
const MAX_CACHE_AGE_MS = FX_CACHE_TTL_SECONDS * 1000;

const STATIC_RATES: CurrencyRatesSnapshot = {
  base: "usd",
  rates: { ...DEFAULT_FX_RATES },
  fetchedAt: 0,
  source: "static",
};

export async function getCurrencyRates(forceRefresh = false): Promise<CurrencyRatesSnapshot> {
  const cached = await cacheGet<CurrencyRatesSnapshot>(FX_CACHE_KEY);
  const isCacheFresh = cached ? Date.now() - cached.fetchedAt < MAX_CACHE_AGE_MS : false;

  if (!forceRefresh && cached && isCacheFresh) {
    return cached;
  }

  const live = await fetchCurrencyApiRates().catch((error) => {
    console.warn("Failed to fetch currency rates", error);
    return null;
  });

  if (live) {
    await cacheSet(FX_CACHE_KEY, live, FX_CACHE_TTL_SECONDS).catch(() => {});
    return live;
  }

  if (cached) {
    return { ...cached, stale: true, source: "cache" };
  }

  return { ...STATIC_RATES, stale: true };
}

export function normalizeCalculationInputToUsd(
  input: CalculationInput,
  currency: SupportedCurrency,
  snapshot: CurrencyRatesSnapshot,
): CalculationInput {
  if (currency === "usd") {
    return input;
  }
  const hourlyRate = convertAmount(input.hourlyRate, currency, "usd", snapshot, 4);
  return {
    ...input,
    hourlyRate,
  };
}

async function fetchCurrencyApiRates(): Promise<CurrencyRatesSnapshot | null> {
  const apiKey = process.env.CURRENCY_API_KEY;
  if (!apiKey) {
    console.warn("Missing CURRENCY_API_KEY env var. Falling back to static FX rates.");
    return null;
  }
  const url = new URL("https://api.currencyapi.com/v3/latest");
  url.searchParams.set("base_currency", "USD");
  url.searchParams.set("currencies", "USD,EUR,GBP");

  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
    },
    next: { revalidate: FX_CACHE_TTL_SECONDS },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Currency API error: ${response.status} ${text}`);
  }
  const payload = (await response.json()) as CurrencyApiResponse;
  if (!payload?.data) {
    throw new Error("Currency API response missing data");
  }

  const normalizedRates: Record<SupportedCurrency, number> = {
    usd: 1,
    eur: payload.data.EUR?.value ?? STATIC_RATES.rates.eur,
    gbp: payload.data.GBP?.value ?? STATIC_RATES.rates.gbp,
  };

  return {
    base: "usd",
    rates: normalizedRates,
    fetchedAt: Date.now(),
    source: "live",
  };
}

interface CurrencyApiResponse {
  data: Record<string, { value: number }>;
}

