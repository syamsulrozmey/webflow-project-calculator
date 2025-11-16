import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateCost } from "@/lib/calculator";
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
import {
  applyAiMultiplierToResult,
  buildAiReadyInput,
} from "@/lib/calculator/ai-enhancement";
import { cacheGet, cacheSet } from "@/lib/cache";
import { ApiError, handleApiError } from "@/lib/http";
import { rateLimitByKey } from "@/lib/rate-limit";
import { ComplexityInsightSchema } from "@/types/ai";

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
    assumptions: z
      .string()
      .max(600, "Assumptions must be under 600 characters")
      .optional(),
  })
  .extend({
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
    const { aiInsight, ...calculationInput } = parsed;
    const baseInput = calculationInput as CalculationInput;

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

    const cacheKey = [
      baseInput.projectType,
      baseInput.tier,
      baseInput.hourlyRate,
      baseInput.maintenance,
      ...Object.values(baseInput.multipliers),
    ].join(":");

    if (!aiInsight) {
      const cached = await cacheGet<CalculationResult>(cacheKey);
      if (cached) {
        return NextResponse.json({ data: cached, cached: true });
      }
    }

    const deterministicResult = calculateCost(baseInput);

    if (!aiInsight) {
      cacheSet(cacheKey, deterministicResult).catch(() => {});
      return NextResponse.json({ data: deterministicResult });
    }

    const aiInput = buildAiReadyInput(baseInput, aiInsight);
    const aiResult = calculateCost(aiInput.effectiveInput);
    const adjusted = applyAiMultiplierToResult(
      aiResult,
      baseInput.hourlyRate,
      aiInput.multiplier,
    );

    const finalResult: CalculationResult = {
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

    return NextResponse.json({ data: finalResult, aiApplied: true });
  } catch (error) {
    return handleApiError(error);
  }
}

