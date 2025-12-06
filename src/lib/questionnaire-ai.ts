import {
  questionnaireSections,
  type EntryFlow,
  type QuestionnaireUserType,
} from "@/config/questionnaire";
import type { QuestionnaireAnswerMap } from "@/lib/questionnaire";
import type { ProjectType } from "@/lib/calculator/types";

interface AiSummaryPayload {
  projectType: ProjectType;
  summary: string;
  features: string[];
  constraints: string[];
  signals: Record<string, number | string>;
  missing: string[];
}

function getQuestion(questionId: string) {
  for (const section of questionnaireSections) {
    const match = section.questions.find((question) => question.id === questionId);
    if (match) return match;
  }
  return null;
}

function getOptionLabel(questionId: string, value?: string | null) {
  if (!value) return null;
  const question = getQuestion(questionId);
  if (!question?.options) return null;
  return question.options.find((option) => option.value === value)?.label ?? null;
}

function mapProjectType(value?: string | null): ProjectType {
  switch (value) {
    case "landing":
      return "landing_page";
    case "marketing":
      return "small_business";
    case "commerce":
      return "ecommerce";
    case "webapp":
      return "web_app";
    default:
      return "landing_page";
  }
}

function listOptions(questionId: string, values?: string[] | QuestionnaireAnswerMap[string]) {
  if (!Array.isArray(values) || values.length === 0) return [];
  return values
    .map((value) => getOptionLabel(questionId, value))
    .filter((label): label is string => Boolean(label));
}

export function buildAiSummaryPayload(
  answers: QuestionnaireAnswerMap,
  options: { entry?: EntryFlow | null; userType?: QuestionnaireUserType | null },
): AiSummaryPayload {
  const summaryParts: string[] = [];
  const features: string[] = [];
  const constraints: string[] = [];
  const signals: Record<string, number | string> = {};
  const missing: string[] = [];

  const projectLabel = getOptionLabel("project_type", answers.project_type as string);
  const projectType = mapProjectType(answers.project_type as string);

  if (projectLabel) {
    summaryParts.push(`Project scope: ${projectLabel}`);
  } else {
    missing.push("Project type");
  }

  if (options.entry) {
    summaryParts.push(
      options.entry === "fresh"
        ? "Flow: net-new build"
        : "Flow: migrate existing site to Webflow",
    );
  }

  if (options.userType) {
    summaryParts.push(`User type: ${options.userType}`);
  }

  const designDepth = getOptionLabel("design_depth", answers.design_depth as string);
  if (designDepth) {
    summaryParts.push(`Design depth: ${designDepth}`);
  }

  const motionStrategy = getOptionLabel("motion_strategy", answers.motion_strategy as string);
  if (motionStrategy) {
    summaryParts.push(`Motion plan: ${motionStrategy}`);
  }

  const featureStack = listOptions("feature_stack", answers.feature_stack as string[]);
  if (featureStack.length) {
    features.push(...featureStack);
  } else {
    missing.push("Functionality stack");
  }

  const contentSupport = getOptionLabel("content_support", answers.content_support as string);
  if (contentSupport) {
    summaryParts.push(`Content plan: ${contentSupport}`);
  }

  const hostingStrategy = getOptionLabel("hosting_strategy", answers.hosting_strategy as string);
  if (hostingStrategy) {
    summaryParts.push(`Hosting: ${hostingStrategy}`);
  }

  const seoSupport = getOptionLabel("seo_support", answers.seo_support as string);
  if (seoSupport) {
    summaryParts.push(`SEO: ${seoSupport}`);
  }

  const timelineUrgency = getOptionLabel("timeline_urgency", answers.timeline_urgency as string);
  if (timelineUrgency) {
    constraints.push(`Timeline: ${timelineUrgency}`);
  } else {
    missing.push("Timeline urgency");
  }

  const deadlineConfidence = getOptionLabel(
    "deadline_confidence",
    answers.deadline_confidence as string,
  );
  if (deadlineConfidence) {
    constraints.push(`Deadline: ${deadlineConfidence}`);
  }

  if (typeof answers.review_cycles === "number") {
    signals.reviewCycles = answers.review_cycles;
  }

  const maintenancePlan = getOptionLabel("maintenance_plan", answers.maintenance_plan as string);
  if (maintenancePlan) {
    constraints.push(`Maintenance: ${maintenancePlan}`);
  }

  const maintenanceCadence = getOptionLabel(
    "maintenance_cadence",
    answers.maintenance_cadence as string,
  );
  if (maintenanceCadence) {
    constraints.push(`Maintenance cadence: ${maintenanceCadence}`);
  }

  const maintenanceOwner = getOptionLabel("maintenance_owner", answers.maintenance_owner as string);
  if (maintenanceOwner) {
    constraints.push(`Maintenance owner: ${maintenanceOwner}`);
  }

  if (typeof answers.page_volume === "number") {
    signals.pages = answers.page_volume;
  } else {
    missing.push("Page volume");
  }

  if (typeof answers.cms_collections === "number") {
    signals.cmsCollections = answers.cms_collections;
  }

  if (typeof answers.motion_complexity === "number") {
    signals.interactionSequences = answers.motion_complexity;
  }

  if (typeof answers.stakeholders === "number") {
    signals.approvers = answers.stakeholders;
  }

  const hostingNotes = typeof answers.hosting_notes === "string" ? answers.hosting_notes : null;
  if (hostingNotes) {
    summaryParts.push(`Hosting notes captured`);
  }

  const integrationTargets = listOptions(
    "integration_targets",
    answers.integration_targets as string[],
  );
  if (integrationTargets.length) {
    features.push(...integrationTargets.map((item) => `Integration: ${item}`));
  }

  const assetNeeds = listOptions("asset_needs", answers.asset_needs as string[]);
  if (assetNeeds.length) {
    features.push(...assetNeeds.map((item) => `Asset: ${item}`));
  }

  const performanceTargets = listOptions(
    "performance_targets",
    answers.performance_targets as string[],
  );
  if (performanceTargets.length) {
    constraints.push(...performanceTargets.map((item) => `Performance: ${item}`));
  }

  const securityPosture = getOptionLabel("security_posture", answers.security_posture as string);
  if (securityPosture) {
    constraints.push(`Security: ${securityPosture}`);
  }

  const accessibilityTarget = getOptionLabel(
    "accessibility_target",
    answers.accessibility_target as string,
  );
  if (accessibilityTarget) {
    constraints.push(`Accessibility: ${accessibilityTarget}`);
  }

  const browserSupport = listOptions("browser_support", answers.browser_support as string[]);
  if (browserSupport.length) {
    constraints.push(...browserSupport.map((item) => `Browser/device: ${item}`));
  }

  const summary = summaryParts.join(". ");

  return {
    projectType,
    summary,
    features,
    constraints,
    signals,
    missing,
  };
}


