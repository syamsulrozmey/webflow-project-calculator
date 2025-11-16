import { calculateCost } from "@/lib/calculator";
import type { CalculationInput, CalculationResult } from "@/lib/calculator/types";

const DEMO_INPUT: CalculationInput = {
  projectType: "small_business",
  tier: "standard",
  hourlyRate: 125,
  maintenance: "standard",
  multipliers: {
    design: "custom",
    functionality: "advanced",
    content: "mixed",
    technical: "integrations",
    timeline: "standard",
  },
  assumptions:
    "Includes content refresh for 12 marketing pages, advanced interactions in hero + product tour, and HubSpot integration.",
};

let cachedResult: CalculationResult | null = null;

export function getDemoCalculation(): CalculationResult {
  if (!cachedResult) {
    cachedResult = calculateCost(DEMO_INPUT);
  }
  return cachedResult;
}


