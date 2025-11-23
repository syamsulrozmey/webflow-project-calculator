import type { QuestionnaireAnswerMap } from "@/config/questionnaire";

export type ComplexityTier = "starter" | "professional" | "growth" | "enterprise";

export interface ComplexityCategoryScore {
  id: ComplexityCategoryId;
  label: string;
  score: number;
  max: number;
  rationale: string;
}

export interface ComplexityScore {
  total: number;
  tier: ComplexityTier;
  bufferPercentage: number;
  categories: ComplexityCategoryScore[];
}

type ComplexityCategoryId =
  | "pages"
  | "cms"
  | "integrations"
  | "commerce"
  | "custom_code"
  | "motion"
  | "compliance";

const BUFFER_BY_TIER: Record<ComplexityTier, number> = {
  starter: 0.2,
  professional: 0.25,
  growth: 0.3,
  enterprise: 0.4,
};

export function evaluateComplexity(answers: QuestionnaireAnswerMap): ComplexityScore {
  const categories: ComplexityCategoryScore[] = [
    scorePages(answers),
    scoreCms(answers),
    scoreIntegrations(answers),
    scoreCommerce(answers),
    scoreCustomCode(answers),
    scoreMotion(answers),
    scoreCompliance(answers),
  ];

  const total = categories.reduce((sum, category) => sum + category.score, 0);
  const tier = mapTier(total);

  return {
    total,
    tier,
    bufferPercentage: BUFFER_BY_TIER[tier],
    categories,
  };
}

function scorePages(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const pages = asNumber(answers.page_volume) ?? 12;
  let score = 1;
  if (pages <= 10) score = 1;
  else if (pages <= 30) score = 2;
  else if (pages <= 50) score = 3;
  else score = 4;
  return {
    id: "pages",
    label: "Page volume",
    score,
    max: 4,
    rationale: `${pages} unique layouts`,
  };
}

function scoreCms(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const collections = asNumber(answers.cms_collections) ?? 0;
  let score = 0;
  if (collections === 0) score = 0;
  else if (collections <= 3) score = 1;
  else if (collections <= 10) score = 2;
  else score = 3;

  const helper = collections === 0 ? "Static site" : `${collections} CMS collections`;

  return {
    id: "cms",
    label: "CMS depth",
    score,
    max: 3,
    rationale: helper,
  };
}

function scoreIntegrations(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const integrations = asArray(answers.integration_targets);
  const hasIntegrationsFlag = asArray(answers.feature_stack).includes("integrations");
  const integrationCount = hasIntegrationsFlag && integrations.length === 0 ? 1 : integrations.length;

  let score = 0;
  if (integrationCount === 0) score = 0;
  else if (integrationCount <= 2) score = 1;
  else if (integrationCount <= 4) score = 2;
  else score = 3;

  const rationale =
    integrationCount === 0
      ? "No third-party integrations"
      : `${integrationCount} integration${integrationCount > 1 ? "s" : ""} scoped`;

  return {
    id: "integrations",
    label: "Integrations",
    score,
    max: 3,
    rationale,
  };
}

function scoreCommerce(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const hasCommerce = asArray(answers.feature_stack).includes("commerce");
  const depth = asString(answers.commerce_catalog);

  let score = 0;
  let rationale = "No commerce";

  if (hasCommerce) {
    if (depth === "lite") {
      score = 2;
      rationale = "Under 25 SKUs";
    } else if (depth === "enterprise") {
      score = 4;
      rationale = "200+ SKUs / variants";
    } else {
      score = 3;
      rationale = "Standard catalog";
    }
  }

  return {
    id: "commerce",
    label: "Commerce footprint",
    score,
    max: 4,
    rationale,
  };
}

function scoreCustomCode(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const featureStack = asArray(answers.feature_stack);
  const integrationTargets = asArray(answers.integration_targets);
  const hasAuth = answers.auth_requirements === true;
  const hasCustomApi = integrationTargets.includes("custom_api");
  const memberships = featureStack.includes("memberships");
  const advancedForms = featureStack.includes("forms") && integrationTargets.includes("custom_api");

  let score = 0;
  if (hasAuth || memberships) score += 2;
  if (hasCustomApi) score += 2;
  else if (advancedForms) score += 1;

  score = Math.min(score, 3);

  const rationaleParts = [];
  if (hasAuth) rationaleParts.push("Authenticated areas");
  if (memberships) rationaleParts.push("Membership/gated flows");
  if (hasCustomApi) rationaleParts.push("Custom API hooks");
  if (advancedForms && !hasCustomApi) rationaleParts.push("Advanced form logic");
  if (rationaleParts.length === 0) rationaleParts.push("No bespoke code requirements");

  return {
    id: "custom_code",
    label: "Custom functionality",
    score,
    max: 3,
    rationale: rationaleParts.join(" · "),
  };
}

function scoreMotion(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const depth = asString(answers.design_depth);
  const motion = asString(answers.motion_strategy);
  const sequences = asNumber(answers.motion_complexity) ?? 0;

  let score = 0;
  if (depth === "template") score = 0;
  else if (depth === "customized") score = 1;
  else if (depth === "net-new") score = 2;

  if (motion === "standard") score += 1;
  else if (motion === "advanced") score += 2;

  if (sequences >= 4) score += 1;

  score = Math.min(score, 4);

  const rationale = [
    depth === "net-new" ? "Net-new system" : depth === "customized" ? "Customized kit" : "Template",
    motion === "advanced" ? "Advanced motion" : motion === "standard" ? "Standard interactions" : "Minimal motion",
    sequences > 0 ? `${sequences} signature sequences` : "Few bespoke sequences",
  ].join(" · ");

  return {
    id: "motion",
    label: "Design & motion",
    score,
    max: 4,
    rationale,
  };
}

function scoreCompliance(answers: QuestionnaireAnswerMap): ComplexityCategoryScore {
  const performance = asArray(answers.performance_targets).length;
  const compliance = asArray(answers.compliance_needs).length;
  const security = asString(answers.security_posture);
  const accessibility = asString(answers.accessibility_target);

  let score = 0;
  if (performance > 0) score += 1;
  if (performance > 1) score += 1;
  if (compliance > 0) score += 2;
  if (security === "enterprise") score += 1;
  else if (security === "regulated") score += 2;
  if (accessibility === "wcag_aaa") score += 1;

  score = Math.min(score, 4);

  const rationaleParts = [];
  if (compliance) rationaleParts.push(`${compliance} compliance frameworks`);
  if (performance) rationaleParts.push(`${performance} performance targets`);
  if (security && security !== "standard") rationaleParts.push(toTitleCase(security));
  if (accessibility && accessibility !== "wcag_aa") rationaleParts.push(accessibility.toUpperCase());
  if (!rationaleParts.length) rationaleParts.push("Baseline compliance");

  return {
    id: "compliance",
    label: "Compliance & QA",
    score,
    max: 4,
    rationale: rationaleParts.join(" · "),
  };
}

function mapTier(total: number): ComplexityTier {
  if (total <= 5) return "starter";
  if (total <= 10) return "professional";
  if (total <= 15) return "growth";
  return "enterprise";
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  return [];
}

function toTitleCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


