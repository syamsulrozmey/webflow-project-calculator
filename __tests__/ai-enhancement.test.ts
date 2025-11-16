import {
  applyAiMultiplierToResult,
  mergeMultipliersWithAi,
  computeAiGlobalMultiplier,
} from "@/lib/calculator/ai-enhancement";
import type {
  CalculationResult,
  ComplexityMultipliers,
} from "@/lib/calculator/types";
import type { ComplexityInsight } from "@/types/ai";

const baseMultipliers: ComplexityMultipliers = {
  design: "standard",
  functionality: "basic",
  content: "existing",
  technical: "basic",
  timeline: "standard",
};

const sampleInsight: ComplexityInsight = {
  complexityScore: 82,
  confidence: 0.8,
  multipliers: {
    design: "custom",
    functionality: "advanced",
    content: "mixed",
    technical: "integrations",
    timeline: "rush",
  },
  factorConfidences: {
    design: 0.9,
    functionality: 0.6,
    content: 0.4,
    technical: 0.8,
    timeline: 0.7,
  },
  highlights: ["Multiple integrations and rush timing"],
  risks: [],
  rationale: "Rush timeline with integrations increases scope.",
  source: "openrouter",
};

function buildResult(): CalculationResult {
  return {
    projectType: "landing_page",
    tier: "simple",
    multipliersApplied: baseMultipliers,
    maintenanceLevel: "standard",
    totalHours: 100,
    totalCost: 10000,
    effectiveHourlyRate: 100,
    maintenanceHours: 10,
    maintenanceCost: 1000,
    baseHours: 80,
    factors: {
      design: 1,
      functionality: 1,
      content: 1,
      technical: 1,
      timeline: 1,
    },
    lineItems: [
      {
        id: "strategy",
        label: "Strategy",
        hours: 20,
        cost: 2000,
        description: "",
      },
      {
        id: "design",
        label: "Design",
        hours: 30,
        cost: 3000,
        description: "",
      },
      {
        id: "development",
        label: "Development",
        hours: 40,
        cost: 4000,
        description: "",
      },
      {
        id: "qa",
        label: "QA",
        hours: 10,
        cost: 1000,
        description: "",
      },
    ],
  };
}

describe("AI enhancement helpers", () => {
  it("merges multipliers based on AI confidence", () => {
    const { blended, overrides } = mergeMultipliersWithAi(
      baseMultipliers,
      sampleInsight,
    );
    expect(blended.design).toBe("custom");
    expect(blended.functionality).toBe("advanced");
    expect(blended.content).toBe("mixed"); // medium confidence -> heavier option
    expect(overrides.design).toBe("custom");
    expect(overrides.content).toBe("mixed");
  });

  it("computes a consistent global multiplier", () => {
    const multiplier = computeAiGlobalMultiplier(sampleInsight);
    expect(multiplier).toBeGreaterThan(1);
    expect(multiplier).toBeLessThan(1.2);
  });

  it("applies AI multiplier to calculation result totals", () => {
    const base = buildResult();
    const adjusted = applyAiMultiplierToResult(base, 100, 1.1);
    expect(adjusted.totalHours).toBeGreaterThan(base.totalHours);
    expect(adjusted.totalCost).toBeGreaterThan(base.totalCost);
    expect(adjusted.lineItems[0].hours).toBeGreaterThan(base.lineItems[0].hours);
    expect(adjusted.lineItems[0].cost).toBeGreaterThan(base.lineItems[0].cost);
  });
});


