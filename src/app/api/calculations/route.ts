import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateCost } from "@/lib/calculator";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/calculator/from-answers";
import {
  PROJECT_BASE_HOURS,
  MAX_HOURLY_RATE,
  MIN_HOURLY_RATE,
} from "@/lib/calculator/config";
import {
  CONTENT_COMPLEXITIES,
  DESIGN_COMPLEXITIES,
  FUNCTIONALITY_COMPLEXITIES,
  MAINTENANCE_LEVELS,
  PROJECT_TYPES,
  TECHNICAL_COMPLEXITIES,
  TIMELINE_URGENCY,
  type CalculationInput,
  type CalculationResult,
} from "@/lib/calculator/types";
import type { ComplexityScore } from "@/lib/calculator/complexity-score";
import {
  applyAiMultiplierToResult,
  buildAiReadyInput,
} from "@/lib/calculator/ai-enhancement";
import {
  convertResultCurrency,
  getCurrencyRates,
  normalizeCalculationInputToUsd,
} from "@/lib/currency/rates";
import { cacheGet, cacheSet } from "@/lib/cache";
import { ApiError, handleApiError } from "@/lib/http";
import { rateLimitByKey } from "@/lib/rate-limit";
import { ComplexityInsightSchema } from "@/types/ai";

const DEFAULT_COMPLEXITY: ComplexityScore = {
  total: 6,
  tier: "professional",
  bufferPercentage: 0.25,
  categories: [],
};

const CalculationSchema = z
  .object({
    projectType: z.enum(PROJECT_TYPES),
    tier: z.string().min(1, "Tier is required"),
    hourlyRate: z.coerce
      .number()
      .min(MIN_HOURLY_RATE, `Hourly rate must be at least ${MIN_HOURLY_RATE}`)
      .max(MAX_HOURLY_RATE, `Hourly rate must be under ${MAX_HOURLY_RATE}`),
    multipliers: z.object({
      design: z.enum(DESIGN_COMPLEXITIES),
      functionality: z.enum(FUNCTIONALITY_COMPLEXITIES),
      content: z.enum(CONTENT_COMPLEXITIES),
      technical: z.enum(TECHNICAL_COMPLEXITIES),
      timeline: z.enum(TIMELINE_URGENCY),
    }),
    maintenance: z.enum(MAINTENANCE_LEVELS),
    currency: z.enum(SUPPORTED_CURRENCIES).default("usd"),
    assumptions: z
      .string()
      .max(600, "Assumptions must be under 600 characters")
      .optional(),
  })
  .extend({
    complexity: z
      .object({
        total: z.number(),
        tier: z.enum(["starter", "professional", "growth", "enterprise"] as const),
        bufferPercentage: z.number(),
        categories: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            score: z.number(),
            max: z.number(),
            rationale: z.string(),
          }),
        ),
      })
      .optional(),
    aiInsight: ComplexityInsightSchema.optional(),
  });

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";
    const limit = await rateLimitByKey(`calc:${ip}`, 20, 60);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again soon." },
        { status: 429 },
      );
    }

    const json = await request.json().catch(() => {
      throw new ApiError("Invalid JSON body", 400);
    });
    const parsed = CalculationSchema.parse(json);
    const { aiInsight, currency, ...calculationInput } = parsed;
    const requestedCurrency: SupportedCurrency = currency ?? "usd";
    const baseInput = calculationInput as CalculationInput;
    baseInput.complexity = baseInput.complexity ?? DEFAULT_COMPLEXITY;

    const tiers = PROJECT_BASE_HOURS[baseInput.projectType];
    if (!tiers[baseInput.tier]) {
      return NextResponse.json(
        {
          error: `Invalid tier "${baseInput.tier}" for project type "${baseInput.projectType}".`,
          allowedTiers: Object.keys(tiers),
        },
        { status: 400 },
      );
    }

    const fxSnapshot = await getCurrencyRates();
    const normalizedInput = normalizeCalculationInputToUsd(
      baseInput,
      requestedCurrency,
      fxSnapshot,
    );

    const cacheKey = [
      normalizedInput.projectType,
      normalizedInput.tier,
      normalizedInput.hourlyRate.toFixed(4),
      normalizedInput.maintenance,
      ...Object.values(normalizedInput.multipliers),
    ].join(":");

    if (!aiInsight) {
      const cached = await cacheGet<CalculationResult>(cacheKey);
      if (cached) {
        const cachedResult =
          requestedCurrency === "usd"
            ? cached
            : convertResultCurrency(cached, "usd", requestedCurrency, fxSnapshot);
        return NextResponse.json({ data: cachedResult, cached: true });
      }
    }

    const deterministicResult = calculateCost(normalizedInput);

    if (!aiInsight) {
      cacheSet(cacheKey, deterministicResult).catch(() => {});
      const responseResult =
        requestedCurrency === "usd"
          ? deterministicResult
          : convertResultCurrency(deterministicResult, "usd", requestedCurrency, fxSnapshot);
      return NextResponse.json({ data: responseResult });
    }

    const aiInput = buildAiReadyInput(baseInput, aiInsight);
    const normalizedAiInput = normalizeCalculationInputToUsd(
      aiInput.effectiveInput,
      requestedCurrency,
      fxSnapshot,
    );
    const aiResult = calculateCost(normalizedAiInput);
    const adjusted = applyAiMultiplierToResult(
      aiResult,
      normalizedAiInput.hourlyRate,
      aiInput.multiplier,
    );

    const finalResultBase: CalculationResult = {
      ...adjusted,
      ai: {
        source: aiInsight.source ?? "openrouter",
        complexityScore: aiInsight.complexityScore,
        confidence: aiInsight.confidence,
        globalMultiplier: aiInput.multiplier,
        overridesApplied: aiInput.overrides,
        highlights: aiInsight.highlights,
        risks: aiInsight.risks,
        rationale: aiInsight.rationale,
      },
      deterministicTotals: {
        totalHours: deterministicResult.totalHours,
        totalCost: deterministicResult.totalCost,
      },
    };

    const finalResult =
      requestedCurrency === "usd"
        ? finalResultBase
        : convertResultCurrency(finalResultBase, "usd", requestedCurrency, fxSnapshot);

    return NextResponse.json({ data: finalResult, aiApplied: true });
  } catch (error) {
    return handleApiError(error);
  }
}

