import type {
  CalculationInput,
  ComplexityMultipliers,
  MaintenanceLevel,
  ProjectType,
  TierLookup,
} from "@/lib/calculator/types";
import type {
  EntryFlow,
  QuestionnaireAnswerMap,
  QuestionnaireUserType,
} from "@/config/questionnaire";
import type { AgencyRateSummary } from "@/lib/agency/types";

type QuestionnaireValue = string | number | boolean | string[] | null | undefined;

const PROJECT_TYPE_MAP: Record<string, ProjectType> = {
  landing: "landing_page",
  marketing: "small_business",
  commerce: "ecommerce",
  webapp: "web_app",
};

const DEFAULT_TIER: Record<ProjectType, TierLookup> = {
  landing_page: "moderate",
  small_business: "standard",
  ecommerce: "medium_catalog",
  web_app: "standard_crud",
};

const USER_RATE_MAP: Record<QuestionnaireUserType, number> = {
  freelancer: 95,
  agency: 135,
  company: 115,
};

const USER_MARGIN_MAP: Record<QuestionnaireUserType, number> = {
  freelancer: 0.25,
  agency: 0.3,
  company: 0.2,
};

const CURRENCIES = ["usd", "eur", "gbp"] as const;
export type SupportedCurrency = (typeof CURRENCIES)[number];

function asString(value: QuestionnaireValue): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: QuestionnaireValue): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asStringArray(value: QuestionnaireValue): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function mapProjectType(value?: string): ProjectType {
  return PROJECT_TYPE_MAP[value ?? ""] ?? "landing_page";
}

function mapTier(projectType: ProjectType, answers: QuestionnaireAnswerMap): TierLookup {
  const pages = asNumber(answers.page_volume) ?? 8;
  const collections = asNumber(answers.cms_collections) ?? 0;

  if (projectType === "landing_page") {
    if (pages <= 5) return "simple";
    if (pages >= 12) return "complex";
    return "moderate";
  }

  if (projectType === "small_business") {
    return pages <= 8 ? "basic" : "standard";
  }

  if (projectType === "ecommerce") {
    const depth = asString(answers.commerce_catalog);
    if (depth === "lite") return "small_catalog";
    if (depth === "enterprise") return "large_catalog";
    return "medium_catalog";
  }

  if (projectType === "web_app") {
    const featureCount = asStringArray(answers.feature_stack).length;
    if (featureCount <= 2 && collections < 3) return "standard_crud";
    if (featureCount >= 4 || collections > 6) return "enterprise";
    return "complex_saas";
  }

  return DEFAULT_TIER[projectType];
}

function mapDesignMultiplier(answers: QuestionnaireAnswerMap): ComplexityMultipliers["design"] {
  const depth = asString(answers.design_depth);
  const motion = asString(answers.motion_strategy);
  if (depth === "template") return "minimal";
  if (depth === "net-new") {
    return motion === "advanced" ? "immersive" : "custom";
  }
  return motion === "advanced" ? "immersive" : "standard";
}

function mapFunctionalityMultiplier(
  answers: QuestionnaireAnswerMap,
): ComplexityMultipliers["functionality"] {
  const features = asStringArray(answers.feature_stack);
  const advancedFlags = ["commerce", "memberships", "integrations"];
  const advancedCount = features.filter((feature) => advancedFlags.includes(feature)).length;
  if (features.length <= 1) return "basic";
  if (advancedCount >= 2) return "advanced";
  return features.length >= 4 ? "enterprise" : "enhanced";
}

function mapContentMultiplier(
  answers: QuestionnaireAnswerMap,
): ComplexityMultipliers["content"] {
  const support = asString(answers.content_support);
  const localization = asString(answers.localization);
  if (localization === "multi") return "multilingual";
  if (support === "net-new") return "net_new";
  if (support === "rewrite") return "mixed";
  return "existing";
}

function mapTechnicalMultiplier(
  answers: QuestionnaireAnswerMap,
): ComplexityMultipliers["technical"] {
  const performance = asStringArray(answers.performance_targets);
  const compliance = asStringArray(answers.compliance_needs);
  const hasIntegrations = asStringArray(answers.feature_stack).includes("integrations");
  if (compliance.length > 0) return "regulated";
  if (hasIntegrations || performance.length >= 2) return "complex";
  if (performance.length === 1) return "integrations";
  return "basic";
}

function mapTimelineMultiplier(
  answers: QuestionnaireAnswerMap,
): ComplexityMultipliers["timeline"] {
  const timeline = asString(answers.timeline_urgency);
  if (timeline === "relaxed") return "relaxed";
  if (timeline === "rush") return "rush";
  if (timeline === "critical") return "critical";
  return "standard";
}

function mapMaintenanceLevel(answers: QuestionnaireAnswerMap): MaintenanceLevel {
  const value = asString(answers.maintenance_plan);
  if (value === "handoff") return "none";
  if (value === "support") return "light";
  if (value === "retainer") return "retainer";
  return "standard";
}

function buildAssumptions(answers: QuestionnaireAnswerMap): string | undefined {
  const notes: string[] = [];
  const hosting = asString(answers.hosting_notes);
  if (hosting) {
    notes.push(`Hosting: ${hosting}`);
  }
  const assets = asStringArray(answers.asset_needs);
  if (assets.length > 0) {
    notes.push(`Extra assets: ${assets.join(", ")}`);
  }
  const integrationTargets = asStringArray(answers.integration_targets);
  if (integrationTargets.length > 0) {
    notes.push(`Integrations: ${integrationTargets.join(", ")}`);
  }
  if (notes.length === 0) {
    return undefined;
  }
  return notes.join(" · ").slice(0, 600);
}

export interface CalculatedPayload {
  input: CalculationInput;
  multipliers: ComplexityMultipliers;
  metadata: {
    hourlyRate: number;
    currency: SupportedCurrency;
    margin: number;
    internalHourlyRate?: number;
    agencyRateSummary?: AgencyRateSummary;
  };
}

function mapCurrency(value?: string): SupportedCurrency {
  if (value && (CURRENCIES as readonly string[]).includes(value)) {
    return value as SupportedCurrency;
  }
  return "usd";
}

function mapHourlyRate(
  answers: QuestionnaireAnswerMap,
  userType?: QuestionnaireUserType | null,
): number {
  const answerRate = asNumber(answers.hourly_rate);
  if (typeof answerRate === "number" && !Number.isNaN(answerRate)) {
    return answerRate;
  }
  if (userType) {
    return USER_RATE_MAP[userType];
  }
  return USER_RATE_MAP.freelancer;
}

function mapMargin(userType?: QuestionnaireUserType | null): number {
  if (userType && USER_MARGIN_MAP[userType] !== undefined) {
    return USER_MARGIN_MAP[userType];
  }
  return USER_MARGIN_MAP.freelancer;
}

export function buildCalculationPayload(opts: {
  answers: QuestionnaireAnswerMap;
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  agencySummary?: AgencyRateSummary;
}): CalculatedPayload {
  const projectType = mapProjectType(asString(opts.answers.project_type));
  const multipliers: ComplexityMultipliers = {
    design: mapDesignMultiplier(opts.answers),
    functionality: mapFunctionalityMultiplier(opts.answers),
    content: mapContentMultiplier(opts.answers),
    technical: mapTechnicalMultiplier(opts.answers),
    timeline: mapTimelineMultiplier(opts.answers),
  };

  const tier = mapTier(projectType, opts.answers);
  const hourlyRate = mapHourlyRate(opts.answers, opts.userType);
  const currency = mapCurrency(asString(opts.answers.rate_currency));
  let margin = mapMargin(opts.userType);
  const internalHourlyRate =
    opts.agencySummary && opts.userType === "agency"
      ? opts.agencySummary.blendedCostRate
      : undefined;
  if (opts.agencySummary && opts.userType === "agency") {
    margin = opts.agencySummary.margin;
  }

  const input: CalculationInput = {
    projectType,
    tier,
    hourlyRate,
    multipliers,
    maintenance: mapMaintenanceLevel(opts.answers),
    assumptions: buildAssumptions(opts.answers),
  };

  return {
    input,
    multipliers,
    metadata: {
      hourlyRate,
      currency,
      margin,
      internalHourlyRate,
      agencyRateSummary:
        opts.userType === "agency" ? opts.agencySummary : undefined,
    },
  };
}


