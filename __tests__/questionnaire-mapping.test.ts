import { buildCalculationPayload } from "@/lib/calculator/from-answers";
import type { QuestionnaireAnswerMap } from "@/lib/questionnaire";

function buildAnswers(overrides: Partial<QuestionnaireAnswerMap> = {}): QuestionnaireAnswerMap {
  return {
    project_type: "landing",
    design_depth: "template",
    motion_strategy: "minimal",
    feature_stack: [],
    content_support: "existing",
    timeline_urgency: "standard",
    deadline_confidence: "target_window",
    review_cycles: 2,
    stakeholders: 2,
    maintenance_plan: "handoff",
    maintenance_cadence: "ad_hoc",
    maintenance_owner: "client_team",
    rate_currency: "usd",
    hourly_rate: 100,
    page_volume: 6,
    cms_collections: 2,
    performance_targets: [],
    compliance_needs: [],
    integration_targets: [],
    asset_needs: [],
    browser_support: [],
    seo_support: "baseline",
    hosting_strategy: "webflow_core",
    security_posture: "standard",
    accessibility_target: "wcag_a",
    ...overrides,
  };
}

describe("buildCalculationPayload mappings", () => {
  it("maps critical urgency to critical multiplier", () => {
    const answers = buildAnswers({ timeline_urgency: "critical" });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.multipliers.timeline).toBe("critical");
  });

  it("escalates maintenance to retainer when cadence is weekly/provider-owned", () => {
    const answers = buildAnswers({
      maintenance_plan: "support",
      maintenance_cadence: "weekly",
      maintenance_owner: "provider",
    });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.maintenance).toBe("retainer");
  });

  it("keeps maintenance at none for handoff and ad-hoc client updates", () => {
    const answers = buildAnswers({
      maintenance_plan: "handoff",
      maintenance_cadence: "ad_hoc",
      maintenance_owner: "client_team",
    });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.maintenance).toBe("none");
  });

  it("treats regulated security posture as regulated technical complexity", () => {
    const answers = buildAnswers({ security_posture: "regulated" });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.multipliers.technical).toBe("regulated");
  });

  it("bumps technical complexity when multiple legacy browsers are required", () => {
    const answers = buildAnswers({ browser_support: ["legacy_safari", "ie_mode"] });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.multipliers.technical).toBe("complex");
  });

  it("treats WCAG AA as integrations-level technical effort", () => {
    const answers = buildAnswers({ accessibility_target: "wcag_aa" });
    const payload = buildCalculationPayload({ answers });
    expect(payload.input.multipliers.technical).toBe("integrations");
  });
});

