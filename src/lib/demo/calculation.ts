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
  complexity: {
    total: 12,
    tier: "growth",
    bufferPercentage: 0.3,
    categories: [
      { id: "pages", label: "Page volume", score: 3, max: 4, rationale: "14 unique layouts" },
      { id: "cms", label: "CMS depth", score: 2, max: 3, rationale: "Six collections w/ relationships" },
      { id: "integrations", label: "Integrations", score: 2, max: 3, rationale: "HubSpot + analytics" },
      { id: "motion", label: "Design & motion", score: 3, max: 4, rationale: "Net-new system + hero storytelling" },
      { id: "compliance", label: "Compliance & QA", score: 2, max: 4, rationale: "Core Web Vitals + WCAG AA" },
      { id: "custom_code", label: "Custom functionality", score: 1, max: 3, rationale: "Advanced forms" },
      { id: "commerce", label: "Commerce footprint", score: 1, max: 4, rationale: "Limited memberships" },
    ],
  },
};

let cachedResult: CalculationResult | null = null;

export function getDemoCalculation(): CalculationResult {
  if (!cachedResult) {
    cachedResult = calculateCost(DEMO_INPUT);
  }
  return cachedResult;
}


