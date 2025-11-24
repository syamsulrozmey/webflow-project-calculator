import { calculateCost } from "@/lib/calculator";
import type { CalculationInput } from "@/lib/calculator/types";
import { getCurrencyRates, normalizeCalculationInputToUsd } from "@/lib/currency/rates";
import { convertCalculationResult } from "@/lib/currency/convert";
import {
  DEFAULT_FX_RATES,
  convertAmount,
  type CurrencyRatesSnapshot,
} from "@/lib/currency/shared";

jest.mock("@/lib/cache", () => ({
  cacheGet: jest.fn(),
  cacheSet: jest.fn().mockResolvedValue(undefined),
}));

const { cacheGet, cacheSet } = jest.requireMock("@/lib/cache") as {
  cacheGet: jest.Mock;
  cacheSet: jest.Mock;
};

const mockFetch = jest.fn();

const SNAPSHOT: CurrencyRatesSnapshot = {
  base: "usd",
  rates: { ...DEFAULT_FX_RATES },
  fetchedAt: Date.now(),
  source: "live",
};

const BASE_INPUT: CalculationInput = {
  projectType: "landing_page",
  tier: "simple",
  hourlyRate: 100,
  multipliers: {
    design: "standard",
    functionality: "basic",
    content: "existing",
    technical: "basic",
    timeline: "standard",
  },
  maintenance: "light",
  maintenanceScope: "core",
  addons: [],
  retainerContext: {},
  complexity: {
    total: 6,
    tier: "professional",
    bufferPercentage: 0.25,
    categories: [],
  },
};

beforeAll(() => {
  (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch = mockFetch as typeof fetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockReset();
  process.env.CURRENCY_API_KEY = "test-key";
});

describe("currency shared helpers", () => {
  it("converts between USD and EUR", () => {
    const eurValue = convertAmount(100, "usd", "eur", SNAPSHOT);
    expect(eurValue).toBeCloseTo(93, 2);
    const usdValue = convertAmount(eurValue, "eur", "usd", SNAPSHOT);
    expect(usdValue).toBeCloseTo(100, 2);
  });

  it("normalizes calculation inputs to USD", () => {
    const normalized = normalizeCalculationInputToUsd(BASE_INPUT, "eur", SNAPSHOT);
    expect(normalized.hourlyRate).toBeCloseTo(107.53, 2);
    expect(normalized.projectType).toBe(BASE_INPUT.projectType);
  });

  it("converts calculation results to a target currency", () => {
    const usdResult = calculateCost(BASE_INPUT);
    const eurResult = convertCalculationResult(usdResult, "usd", "eur", SNAPSHOT);
    expect(eurResult.totalCost).toBeCloseTo(usdResult.totalCost * SNAPSHOT.rates.eur, 2);
    expect(eurResult.retainers[0].monthlyFee).toBeCloseTo(
      usdResult.retainers[0].monthlyFee * SNAPSHOT.rates.eur,
      2,
    );
  });
});

describe("getCurrencyRates", () => {
  it("returns cached rates when they are still fresh", async () => {
    cacheGet.mockResolvedValueOnce(SNAPSHOT);
    const rates = await getCurrencyRates();
    expect(rates).toEqual(SNAPSHOT);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches live rates and caches them when forced", async () => {
    cacheGet.mockResolvedValueOnce(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          USD: { value: 1 },
          EUR: { value: 0.92 },
          GBP: { value: 0.8 },
        },
      }),
    } as Response);
    const rates = await getCurrencyRates(true);
    expect(rates.source).toBe("live");
    expect(cacheSet).toHaveBeenCalled();
  });

  it("falls back to static rates when live fetch fails", async () => {
    cacheGet.mockResolvedValueOnce(null);
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const rates = await getCurrencyRates();
    expect(rates.source).toBe("static");
    expect(rates.stale).toBe(true);
    expect(rates.rates).toEqual(expect.objectContaining(DEFAULT_FX_RATES));
    warnSpy.mockRestore();
  });
});

