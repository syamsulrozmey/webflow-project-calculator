import { calculateCost } from "@/lib/calculator";
import { PROJECT_BASE_HOURS } from "@/lib/calculator/config";

describe("calculateCost", () => {
  it("calculates cost for a simple landing page", () => {
    const input = {
      projectType: "landing_page" as const,
      tier: "simple" as const,
      hourlyRate: 95,
      multipliers: {
        design: "standard",
        functionality: "basic",
        content: "existing",
        technical: "basic",
        timeline: "standard",
      },
      maintenance: "light" as const,
    };

    const result = calculateCost(input);
    const baseHours = PROJECT_BASE_HOURS.landing_page.simple;

    expect(result.baseHours).toBe(baseHours);
    expect(result.totalHours).toBeGreaterThan(baseHours);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.lineItems).toHaveLength(5);
  });

  it("throws when tier does not match project type", () => {
    const input = {
      projectType: "landing_page" as const,
      tier: "standard_crud" as const,
      hourlyRate: 120,
      multipliers: {
        design: "standard",
        functionality: "basic",
        content: "existing",
        technical: "basic",
        timeline: "standard",
      },
      maintenance: "none" as const,
    };

    expect(() => calculateCost(input)).toThrow(/Tier "standard_crud"/);
  });

  it("adds maintenance hours when requested", () => {
    const input = {
      projectType: "web_app" as const,
      tier: "standard_crud" as const,
      hourlyRate: 150,
      multipliers: {
        design: "custom",
        functionality: "advanced",
        content: "mixed",
        technical: "integrations",
        timeline: "rush",
      },
      maintenance: "retainer" as const,
    };

    const result = calculateCost(input);
    expect(result.maintenanceHours).toBeGreaterThan(0);
    expect(result.maintenanceCost).toBeGreaterThan(0);
    expect(result.totalCost).toBeGreaterThan(result.maintenanceCost);
  });
});

