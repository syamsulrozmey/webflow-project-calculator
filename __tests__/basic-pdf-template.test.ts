import type { CalculationMeta } from "@/lib/calculator/storage";
import type { CalculationResult } from "@/lib/calculator/types";
import { getDemoCalculation } from "@/lib/demo/calculation";
import { buildBasicPdfSections } from "@/lib/export/basic-template";

describe("buildBasicPdfSections", () => {
  const baseResult = getDemoCalculation();
  const baseMeta: CalculationMeta = {
    hourlyRate: baseResult.effectiveHourlyRate,
    currency: "usd",
    margin: 0.25,
  };

  it("generates summary, breakdown, and timeline data for free tier exports", () => {
    const sections = buildBasicPdfSections({
      result: baseResult,
      meta: baseMeta,
      tier: "free",
      source: "questionnaire",
      issuedAt: new Date("2025-01-01"),
    });

    expect(sections.header.watermarkText).toContain("Free Tier");
    expect(sections.summary).toHaveLength(5);
    expect(sections.breakdown).toHaveLength(baseResult.lineItems.length);
    expect(sections.timeline[0]?.label).toEqual(baseResult.lineItems[0]?.label);
    expect(sections.scope.highlights.length).toBeGreaterThan(0);
  });

  it("splits assumptions and includes agency economics for higher tiers", () => {
    const clonedResult = JSON.parse(JSON.stringify(baseResult)) as CalculationResult;
    clonedResult.assumptions = "Upfront discovery\nLaunch retainer";

    const meta: CalculationMeta = {
      ...baseMeta,
      agencyRateSummary: {
        blendedCostRate: 85,
        recommendedBillableRate: 135,
        margin: 0.35,
        markup: 0.5,
        totalWeeklyCapacity: 120,
        memberCount: 3,
        teamSnapshot: [
          { id: "pm", name: "Lead PM", role: "Producer", costRate: 70, billableRate: 120 },
          { id: "dev", name: "Dev", role: "Developer", costRate: 80, billableRate: 140 },
          { id: "design", name: "Designer", role: "Designer", costRate: 65, billableRate: 125 },
        ],
      },
    };

    const sections = buildBasicPdfSections({
      result: clonedResult,
      meta,
      tier: "pro",
      source: "analysis",
    });

    expect(sections.header.watermarkText).toBeUndefined();
    expect(sections.scope.assumptions).toEqual(["Upfront discovery", "Launch retainer"]);
    expect(sections.agency).toBeDefined();
    expect(sections.agency?.teamSnapshot).toHaveLength(3);
  });
});


