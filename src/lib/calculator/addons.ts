import type { QuestionnaireAnswerMap } from "@/config/questionnaire";

export type AddonCategory =
  | "integration"
  | "seo"
  | "training"
  | "localization";

export interface AddonInput {
  id: string;
  label: string;
  category: AddonCategory;
  hours: number;
  description: string;
  driver: string;
}

const INTEGRATION_HOURS: Record<string, { hours: number; label: string; description: string }> = {
  crm: {
    hours: 8,
    label: "CRM integration",
    description: "Sync Webflow forms with HubSpot/Salesforce, map lifecycle fields.",
  },
  marketing: {
    hours: 6,
    label: "Marketing automation",
    description: "Wire marketing automations (ActiveCampaign, Klaviyo, Iterable).",
  },
  analytics: {
    hours: 4,
    label: "Analytics/CDP setup",
    description: "Implement GA4, Segment, or Mixpanel events beyond defaults.",
  },
  custom_api: {
    hours: 18,
    label: "Custom API hookup",
    description: "Custom middleware, webhooks, or middleware glue code.",
  },
};

const TRAINING_HOURS: Record<string, { hours: number; label: string; description: string }> = {
  editor: {
    hours: 2,
    label: "Editor onboarding",
    description: "Live training for stakeholder editors + recorded walkthrough.",
  },
  dev: {
    hours: 3,
    label: "Developer handoff",
    description: "Advanced walkthrough covering build architecture.",
  },
  playbooks: {
    hours: 4,
    label: "Custom playbooks",
    description: "Written SOPs or Loom library for future contributors.",
  },
};

const SEO_HOURS: Record<string, { hours: number; label: string; description: string }> = {
  baseline: {
    hours: 4,
    label: "Baseline SEO package",
    description: "Metadata, redirects, XML sitemap validation.",
  },
  managed: {
    hours: 10,
    label: "Managed SEO foundation",
    description: "Keyword briefs, schema, on-page optimization support.",
  },
  partner: {
    hours: 16,
    label: "Partner-led SEO enablement",
    description: "Collaboration with partner SEO teams, data reviews.",
  },
};

const LOCALIZATION_HOURS: Record<string, { hours: number; label: string; description: string }> = {
  dual: {
    hours: 12,
    label: "Dual-language localization",
    description: "Second locale setup incl. language switch + CMS mapping.",
  },
  multi: {
    hours: 20,
    label: "Multi-language localization",
    description: "Three+ locales with structured CMS clones + QA.",
  },
};

export function deriveAddonsFromAnswers(answers: QuestionnaireAnswerMap): AddonInput[] {
  const addons: AddonInput[] = [];
  const integrations = toArray(answers.integration_targets);
  integrations.forEach((integration) => {
    const meta = INTEGRATION_HOURS[integration];
    if (!meta) return;
    addons.push({
      id: `integration:${integration}`,
      label: meta.label,
      category: "integration",
      hours: meta.hours,
      description: meta.description,
      driver: "integration_targets",
    });
  });

  const trainingNeeds = toArray(answers.training_needs);
  trainingNeeds.forEach((need) => {
    const meta = TRAINING_HOURS[need];
    if (!meta) return;
    addons.push({
      id: `training:${need}`,
      label: meta.label,
      category: "training",
      hours: meta.hours,
      description: meta.description,
      driver: "training_needs",
    });
  });

  const seoSupport = asString(answers.seo_support);
  if (seoSupport && SEO_HOURS[seoSupport]) {
    const meta = SEO_HOURS[seoSupport];
    addons.push({
      id: `seo:${seoSupport}`,
      label: meta.label,
      category: "seo",
      hours: meta.hours,
      description: meta.description,
      driver: "seo_support",
    });
  }

  const localization = asString(answers.localization);
  if (localization && LOCALIZATION_HOURS[localization]) {
    const meta = LOCALIZATION_HOURS[localization];
    addons.push({
      id: `localization:${localization}`,
      label: meta.label,
      category: "localization",
      hours: meta.hours,
      description: meta.description,
      driver: "localization",
    });
  }

  return addons;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  return [];
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}


