import type {
  CalculationInput,
  ComplexityMultipliers,
  MaintenanceLevel,
  MaintenanceScope,
  ProjectType,
  TierLookup,
} from "@/lib/calculator/types";
import type {
  EntryFlow,
  QuestionnaireUserType,
} from "@/config/questionnaire";
import type { QuestionnaireAnswerMap } from "@/lib/questionnaire";
import type { AgencyRateSummary } from "@/lib/agency/types";
import { deriveAddonsFromAnswers } from "@/lib/calculator/addons";
import { evaluateComplexity } from "@/lib/calculator/complexity-score";

type QuestionnaireValue = string | number | boolean | string[] | null | undefined;

const PROJECT_TYPE_MAP: Record<string, ProjectType> = {
  landing: "landing_page",
  marketing: "small_business",
  commerce: "ecommerce",
  webapp: "web_app",
};

const DEADLINE_LABELS: Record<string, string> = {
  fixed: "Fixed go-live date",
  target_window: "Target month/quarter",
  flexible: "Flexible milestone window",
};

const MAINTENANCE_CADENCE_LABELS: Record<string, string> = {
  ad_hoc: "Ad-hoc",
  monthly: "Monthly",
  quarterly: "Quarterly",
  weekly: "Weekly / sprint-based",
};

const MAINTENANCE_OWNER_LABELS: Record<string, string> = {
  client_team: "Client-owned",
  shared: "Shared responsibility",
  provider: "Provider-owned",
};

const MAINTENANCE_SCOPE_LABELS: Record<string, string> = {
  core: "Core upkeep & monitoring",
  content_ops: "Content/SEO refresh cycles",
  feature_sprints: "Feature iterations & roadmap",
};

const HOSTING_STRATEGY_LABELS: Record<string, string> = {
  webflow_core: "Webflow core hosting",
  webflow_enterprise: "Webflow Enterprise",
  hybrid: "Hybrid / reverse proxy",
  custom_stack: "Custom stack",
};

const SECURITY_POSTURE_LABELS: Record<string, string> = {
  standard: "Standard SSL + RBAC",
  sso: "SSO / enforced MFA",
  enterprise: "Enterprise review + pen-test",
  regulated: "Regulated controls",
};

const ACCESSIBILITY_TARGET_LABELS: Record<string, string> = {
  wcag_a: "WCAG A",
  wcag_aa: "WCAG AA",
  wcag_aaa: "WCAG AAA",
  custom: "Custom accessibility plan",
};

const BROWSER_SUPPORT_LABELS: Record<string, string> = {
  legacy_safari: "Legacy Safari / iOS 14",
  ie_mode: "IE mode / legacy Edge",
  android_low: "Low-end Android devices",
  desktop_kiosk: "Desktop kiosks / large displays",
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

export const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

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
  const security = asString(answers.security_posture);
  const accessibility = asString(answers.accessibility_target);
  const browserSupport = asStringArray(answers.browser_support);

  if (compliance.length > 0 || security === "regulated") {
    return "regulated";
  }

  if (
    hasIntegrations ||
    performance.length >= 2 ||
    security === "enterprise" ||
    accessibility === "wcag_aaa" ||
    browserSupport.length >= 2
  ) {
    return "complex";
  }

  if (
    performance.length === 1 ||
    security === "sso" ||
    accessibility === "wcag_aa" ||
    browserSupport.length === 1
  ) {
    return "integrations";
  }

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

function mapMaintenanceScope(value?: string): MaintenanceScope {
  if (value === "content_ops") return "content_ops";
  if (value === "feature_sprints") return "feature_sprints";
  return "core";
}

function mapMaintenanceSettings(
  answers: QuestionnaireAnswerMap,
): { level: MaintenanceLevel; scope: MaintenanceScope } {
  const value = asString(answers.maintenance_plan);
  const cadence = asString(answers.maintenance_cadence);
  const owner = asString(answers.maintenance_owner);
  const scope = mapMaintenanceScope(asString(answers.maintenance_scope));

  let level: MaintenanceLevel;
  switch (value) {
    case "handoff":
      level = "none";
      break;
    case "support":
      level = "light";
      break;
    case "retainer":
      level = "standard";
      break;
    default:
      level = "standard";
  }

  const providerOwned = owner === "provider";
  const weeklyCadence = cadence === "weekly";

  if (weeklyCadence && providerOwned) {
    level = "retainer";
  } else if (weeklyCadence) {
    level = level === "none" ? "light" : "standard";
  }

  if (providerOwned && level === "none") {
    level = "light";
  }

  if (cadence === "monthly" && level === "light") {
    level = "standard";
  }

  if (cadence === "quarterly" && level === "none") {
    level = "light";
  }

  if (cadence === "ad_hoc" && owner === "client_team") {
    level = "none";
  }

  if (scope === "feature_sprints" && level !== "none") {
    level = level === "light" ? "standard" : level;
  }

  return { level, scope };
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
  const hostingStrategy = asString(answers.hosting_strategy);
  if (hostingStrategy) {
    notes.push(`Hosting strategy: ${HOSTING_STRATEGY_LABELS[hostingStrategy] ?? hostingStrategy}`);
  }
  const securityPosture = asString(answers.security_posture);
  if (securityPosture) {
    notes.push(
      `Security posture: ${SECURITY_POSTURE_LABELS[securityPosture] ?? securityPosture}`,
    );
  }
  const accessibilityTarget = asString(answers.accessibility_target);
  if (accessibilityTarget) {
    notes.push(
      `Accessibility target: ${
        ACCESSIBILITY_TARGET_LABELS[accessibilityTarget] ?? accessibilityTarget
      }`,
    );
  }
  const browserSupport = asStringArray(answers.browser_support)
    .map((value) => BROWSER_SUPPORT_LABELS[value] ?? value)
    .filter(Boolean);
  if (browserSupport.length > 0) {
    notes.push(`Browser/device support: ${browserSupport.join(", ")}`);
  }
  const deadlineConfidence = asString(answers.deadline_confidence);
  if (deadlineConfidence) {
    notes.push(`Deadline firmness: ${DEADLINE_LABELS[deadlineConfidence] ?? deadlineConfidence}`);
  }
  if (typeof answers.review_cycles === "number") {
    notes.push(`Review cycles: ${answers.review_cycles}`);
  }
  const maintenanceCadence = asString(answers.maintenance_cadence);
  if (maintenanceCadence) {
    notes.push(
      `Maintenance cadence: ${
        MAINTENANCE_CADENCE_LABELS[maintenanceCadence] ?? maintenanceCadence
      }`,
    );
  }
  const maintenanceOwner = asString(answers.maintenance_owner);
  if (maintenanceOwner) {
    notes.push(
      `Maintenance owner: ${MAINTENANCE_OWNER_LABELS[maintenanceOwner] ?? maintenanceOwner}`,
    );
  }
  const maintenanceScope = asString(answers.maintenance_scope);
  if (maintenanceScope) {
    notes.push(
      `Maintenance coverage: ${MAINTENANCE_SCOPE_LABELS[maintenanceScope] ?? maintenanceScope}`,
    );
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
  if (value && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)) {
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
  const maintenanceSettings = mapMaintenanceSettings(opts.answers);
  const complexity = evaluateComplexity(opts.answers);
  const addons = deriveAddonsFromAnswers(opts.answers);
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
    maintenance: maintenanceSettings.level,
    maintenanceScope: maintenanceSettings.scope,
    addons,
    retainerContext: {
      cadence: asString(opts.answers.maintenance_cadence),
      owner: asString(opts.answers.maintenance_owner),
      plan: asString(opts.answers.maintenance_plan),
      hostingStrategy: asString(opts.answers.hosting_strategy),
      hoursTarget: asNumber(opts.answers.maintenance_hours_target),
      sla: asString(opts.answers.maintenance_sla),
    },
    complexity,
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


