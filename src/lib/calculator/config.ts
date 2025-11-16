import type {
  ContentComplexity,
  DesignComplexity,
  EcommerceTier,
  FunctionalityComplexity,
  LandingPageTier,
  MaintenanceLevel,
  ProjectType,
  SmallBusinessTier,
  TechnicalComplexity,
  TimelineUrgency,
  WebAppTier,
} from "./types";

export const PROJECT_BASE_HOURS: Record<
  ProjectType,
  Record<string, number>
> = {
  landing_page: {
    simple: 24,
    moderate: 40,
    complex: 64,
  },
  small_business: {
    basic: 80,
    standard: 120,
  },
  ecommerce: {
    small_catalog: 110,
    medium_catalog: 170,
    large_catalog: 260,
  },
  web_app: {
    standard_crud: 160,
    complex_saas: 240,
    enterprise: 360,
  },
};

export const TIER_DISPLAY_NAMES: Record<ProjectType, Record<string, string>> = {
  landing_page: {
    simple: "Simple",
    moderate: "Moderate Complexity",
    complex: "High Interaction",
  },
  small_business: {
    basic: "Basic (5-10 pages)",
    standard: "Standard (10-20 pages)",
  },
  ecommerce: {
    small_catalog: "Small Catalog (<50 products)",
    medium_catalog: "Medium Catalog (50-500 products)",
    large_catalog: "Large Catalog (500+ products)",
  },
  web_app: {
    standard_crud: "Standard CRUD App",
    complex_saas: "Complex SaaS",
    enterprise: "Enterprise Platform",
  },
};

export const PHASE_ALLOCATION = {
  discovery: { weight: 0.12, label: "Discovery & Strategy" },
  design: { weight: 0.24, label: "Design & UX" },
  development: { weight: 0.34, label: "Development & Integrations" },
  content: { weight: 0.18, label: "Content & CMS" },
  qa: { weight: 0.12, label: "QA, Review & Launch" },
};

export const DESIGN_MULTIPLIERS: Record<DesignComplexity, number> = {
  minimal: 1,
  standard: 1.15,
  custom: 1.35,
  immersive: 1.6,
};

export const FUNCTIONALITY_MULTIPLIERS: Record<
  FunctionalityComplexity,
  number
> = {
  basic: 1,
  enhanced: 1.2,
  advanced: 1.4,
  enterprise: 1.65,
};

export const CONTENT_MULTIPLIERS: Record<ContentComplexity, number> = {
  existing: 1,
  mixed: 1.15,
  net_new: 1.35,
  multilingual: 1.55,
};

export const TECHNICAL_MULTIPLIERS: Record<TechnicalComplexity, number> = {
  basic: 1,
  integrations: 1.15,
  complex: 1.35,
  regulated: 1.55,
};

export const TIMELINE_MULTIPLIERS: Record<TimelineUrgency, number> = {
  relaxed: 0.9,
  standard: 1,
  rush: 1.2,
  critical: 1.4,
};

export const MAINTENANCE_FACTORS: Record<MaintenanceLevel, number> = {
  none: 0,
  light: 0.1,
  standard: 0.2,
  retainer: 0.35,
};

export const MIN_HOURLY_RATE = 25;
export const MAX_HOURLY_RATE = 450;

export type TierMap = {
  landing_page: Record<LandingPageTier, number>;
  small_business: Record<SmallBusinessTier, number>;
  ecommerce: Record<EcommerceTier, number>;
  web_app: Record<WebAppTier, number>;
};

