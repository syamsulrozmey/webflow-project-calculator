import type {
  CalculationInput,
  CalculationResult,
  ComplexityMultipliers,
} from "@/lib/calculator/types";
import {
  CONTENT_COMPLEXITIES,
  DESIGN_COMPLEXITIES,
  FUNCTIONALITY_COMPLEXITIES,
  TECHNICAL_COMPLEXITIES,
  TIMELINE_URGENCY,
} from "@/lib/calculator/types";
import type { ComplexityInsight } from "@/types/ai";

const MULTIPLIER_ORDER: Record<
  keyof ComplexityMultipliers,
  readonly string[]
> = {
  design: DESIGN_COMPLEXITIES,
  functionality: FUNCTIONALITY_COMPLEXITIES,
  content: CONTENT_COMPLEXITIES,
  technical: TECHNICAL_COMPLEXITIES,
  timeline: TIMELINE_URGENCY,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function pickHeavierValue<T extends keyof ComplexityMultipliers>(
  key: T,
  current: ComplexityMultipliers[T],
  proposed: ComplexityMultipliers[T],
) {
  const order = MULTIPLIER_ORDER[key];
  const currentIndex = order.indexOf(current as string);
  const proposedIndex = order.indexOf(proposed as string);
  return proposedIndex > currentIndex ? proposed : current;
}

export function mergeMultipliersWithAi(
  multipliers: ComplexityMultipliers,
  insight?: ComplexityInsight | null,
) {
  if (!insight) {
    return { blended: multipliers, overrides: {} as Partial<ComplexityMultipliers> };
  }

  const blended: ComplexityMultipliers = { ...multipliers };
  const overrides: Partial<ComplexityMultipliers> = {};
  const factorConfidences = insight.factorConfidences ?? {};

  (Object.keys(multipliers) as Array<keyof ComplexityMultipliers>).forEach((key) => {
    const aiValue = insight.multipliers[key];
    if (!aiValue) return;
    const confidence = clamp(
      factorConfidences[key] ?? insight.confidence ?? 0,
      0,
      1,
    );
    if (confidence < 0.3) {
      return;
    }
    if (confidence >= 0.65) {
      if (blended[key] !== aiValue) {
        blended[key] = aiValue as ComplexityMultipliers[typeof key];
        overrides[key] = aiValue;
      }
      return;
    }
    const heavier = pickHeavierValue(key, blended[key], aiValue);
    if (heavier !== blended[key]) {
      blended[key] = heavier as ComplexityMultipliers[typeof key];
      overrides[key] = heavier;
    }
  });

  return { blended, overrides };
}

export function computeAiGlobalMultiplier(insight?: ComplexityInsight | null) {
  if (!insight) return 1;
  const score = clamp(insight.complexityScore / 100, 0, 1);
  const confidence = clamp(insight.confidence ?? 0.5, 0, 1);
  const scoreBias = score - 0.6;
  const multiplier = 1 + scoreBias * 0.4 * (0.5 + confidence / 2);
  return clamp(multiplier, 0.9, 1.2);
}

const round = (value: number) => Math.round(value * 100) / 100;

export function applyAiMultiplierToResult(
  result: CalculationResult,
  hourlyRate: number,
  multiplier: number,
): CalculationResult {
  if (Math.abs(multiplier - 1) < 0.01) {
    return result;
  }
  const factor = clamp(multiplier, 0.8, 1.25);

  const totalHours = round(result.totalHours * factor);
  const maintenanceHours = round(result.maintenanceHours * factor);
  const lineItems = result.lineItems.map((item) => {
    const hours = round(item.hours * factor);
    return {
      ...item,
      hours,
      cost: round(hours * hourlyRate),
    };
  });

  const maintenanceCost = round(maintenanceHours * hourlyRate);
  const totalCost = round(totalHours * hourlyRate);

  return {
    ...result,
    lineItems,
    totalHours,
    totalCost,
    maintenanceHours,
    maintenanceCost,
  };
}

export function buildAiReadyInput(
  input: CalculationInput,
  insight?: ComplexityInsight | null,
) {
  if (!insight) {
    return {
      deterministicInput: input,
      effectiveInput: input,
      overrides: {} as Partial<ComplexityMultipliers>,
      multiplier: 1,
    };
  }

  const { blended, overrides } = mergeMultipliersWithAi(input.multipliers, insight);

  return {
    deterministicInput: input,
    effectiveInput: {
      ...input,
      multipliers: blended,
    },
    overrides,
    multiplier: computeAiGlobalMultiplier(insight),
  };
}


