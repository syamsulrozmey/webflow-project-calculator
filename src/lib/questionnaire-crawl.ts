import {
  questionnaireSections,
  type QuestionDefinition,
  type QuestionnaireAnswer,
} from "@/config/questionnaire";
import type { QuestionnaireAnswerMap } from "@/lib/questionnaire";
import type { AnalysisResult } from "@/types/analysis";

const COMMERCE_KEYWORDS = ["shopify", "commerce", "checkout", "ecommerce"];
const INTEGRATION_TECH = ["zapier", "segment", "hubspot", "salesforce", "mailchimp", "algolia"];
const SEO_KEYWORDS = ["seo", "core web vitals", "performance", "lighthouse", "schema"];

export interface CrawlSuggestion {
  questionId: string;
  label: string;
  value: QuestionnaireAnswer;
  valueLabel: string;
  rationale?: string;
}

export function buildCrawlSuggestions(
  analysis: AnalysisResult | null,
  answers: QuestionnaireAnswerMap,
): CrawlSuggestion[] {
  if (!analysis) return [];
  const suggestions: CrawlSuggestion[] = [];

  const push = (suggestion: CrawlSuggestion | null) => {
    if (suggestion) suggestions.push(suggestion);
  };

  push(suggestProjectType(analysis, answers));
  push(suggestPageVolume(analysis, answers));
  push(suggestFeatureStack(analysis, answers));
  push(suggestSeoSupport(analysis, answers));

  return suggestions;
}

function suggestProjectType(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswerMap,
): CrawlSuggestion | null {
  const current = answers.project_type as string | undefined;
  const next = deriveProjectType(analysis);
  if (!next || current === next) {
    return null;
  }
  const rationale = `Detected ${analysis.metrics.pages} pages on ${analysis.stack.platform}.`;
  return buildSuggestion("project_type", next, rationale);
}

function suggestPageVolume(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswerMap,
): CrawlSuggestion | null {
  const pages = clamp(analysis.metrics.pages, 3, 40);
  const current = answers.page_volume as number | undefined;
  if (typeof current === "number" && Math.abs(current - pages) <= 1) {
    return null;
  }
  const rationale = `Crawl surfaced ${analysis.metrics.pages} indexed pages.`;
  return buildSuggestion("page_volume", pages, rationale, `≈ ${pages} pages`);
}

function suggestFeatureStack(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswerMap,
): CrawlSuggestion | null {
  const question = getQuestion("feature_stack");
  if (!question?.options) return null;
  const detected = new Set<string>();

  if (analysis.metrics.pages >= 8 || analysis.pageTypes.length > 1) {
    detected.add("cms");
  }
  if (analysis.metrics.forms >= 3) {
    detected.add("forms");
  }
  if (isCommerceStack(analysis)) {
    detected.add("commerce");
  }
  if (hasIntegrationSignals(analysis)) {
    detected.add("integrations");
  }

  if (detected.size === 0) {
    return null;
  }

  const ordered = question.options
    .map((option) => option.value)
    .filter((value) => detected.has(value));

  const current = Array.isArray(answers.feature_stack) ? (answers.feature_stack as string[]) : [];
  if (arraysEqual(current, ordered)) {
    return null;
  }

  const rationaleParts: string[] = [];
  if (detected.has("cms")) {
    rationaleParts.push("Multiple CMS-like collections inferred from page structure.");
  }
  if (detected.has("forms")) {
    rationaleParts.push(`${analysis.metrics.forms} forms detected across the site.`);
  }
  if (detected.has("commerce")) {
    rationaleParts.push(`Commerce stack clues (e.g., ${analysis.stack.platform}).`);
  }
  if (detected.has("integrations")) {
    rationaleParts.push("Third-party tooling found (CRM/automation).");
  }

  return buildSuggestion(
    "feature_stack",
    ordered,
    rationaleParts.join(" "),
  );
}

function suggestSeoSupport(
  analysis: AnalysisResult,
  answers: QuestionnaireAnswerMap,
): CrawlSuggestion | null {
  const current = answers.seo_support as string | undefined;
  const hasSeoSignals =
    analysis.warnings.some((warning) => includesKeyword(warning, SEO_KEYWORDS)) ||
    analysis.recommendations.some((rec) => includesKeyword(rec, SEO_KEYWORDS));
  const next = hasSeoSignals ? "managed" : "baseline";
  if (current === next) {
    return null;
  }
  const rationale = hasSeoSignals
    ? "Crawl flagged SEO/performance concerns."
    : "No SEO risks spotted; baseline setup recommended.";
  return buildSuggestion("seo_support", next, rationale);
}

function deriveProjectType(analysis: AnalysisResult): string {
  const platform = analysis.stack.platform.toLowerCase();
  if (COMMERCE_KEYWORDS.some((keyword) => platform.includes(keyword))) {
    return "commerce";
  }
  if (analysis.metrics.pages >= 9) {
    return "marketing";
  }
  return "landing";
}

function isCommerceStack(analysis: AnalysisResult) {
  const haystack = [
    analysis.stack.platform,
    analysis.stack.hosting,
    ...analysis.stack.technologies,
    ...analysis.recommendations,
  ].map((item) => item.toLowerCase());
  return haystack.some((value) => includesKeyword(value, COMMERCE_KEYWORDS));
}

function hasIntegrationSignals(analysis: AnalysisResult) {
  const haystack = analysis.stack.technologies.map((item) => item.toLowerCase());
  return haystack.some((value) => includesKeyword(value, INTEGRATION_TECH));
}

function includesKeyword(value: string, keywords: string[]) {
  const lower = value.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function buildSuggestion(
  questionId: string,
  value: QuestionnaireAnswer,
  rationale?: string,
  customLabel?: string,
): CrawlSuggestion {
  const question = getQuestion(questionId);
  return {
    questionId,
    label: question?.title ?? questionId,
    value,
    valueLabel: customLabel ?? formatValue(questionId, value),
    rationale,
  };
}

function formatValue(questionId: string, value: QuestionnaireAnswer): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => getOptionLabel(questionId, item) ?? String(item))
      .join(", ");
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return getOptionLabel(questionId, value as string) ?? String(value ?? "");
}

function getOptionLabel(questionId: string, value?: string | null) {
  if (!value) return null;
  const question = getQuestion(questionId);
  if (!question?.options) return null;
  return question.options.find((option) => option.value === value)?.label ?? null;
}

function getQuestion(questionId: string): QuestionDefinition | undefined {
  for (const section of questionnaireSections) {
    const question = section.questions.find((item) => item.id === questionId);
    if (question) return question;
  }
  return undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

