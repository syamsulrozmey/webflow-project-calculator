export const PROJECT_TYPES = [
  "landing_page",
  "small_business",
  "ecommerce",
  "web_app",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const LANDING_PAGE_TIERS = ["simple", "moderate", "complex"] as const;
export const SMALL_BUSINESS_TIERS = ["basic", "standard"] as const;
export const ECOMMERCE_TIERS = ["small_catalog", "medium_catalog", "large_catalog"] as const;
export const WEB_APP_TIERS = ["standard_crud", "complex_saas", "enterprise"] as const;

export type LandingPageTier = (typeof LANDING_PAGE_TIERS)[number];
export type SmallBusinessTier = (typeof SMALL_BUSINESS_TIERS)[number];
export type EcommerceTier = (typeof ECOMMERCE_TIERS)[number];
export type WebAppTier = (typeof WEB_APP_TIERS)[number];

export const DESIGN_COMPLEXITIES = [
  "minimal",
  "standard",
  "custom",
  "immersive",
] as const;
export const FUNCTIONALITY_COMPLEXITIES = [
  "basic",
  "enhanced",
  "advanced",
  "enterprise",
] as const;
export const CONTENT_COMPLEXITIES = [
  "existing",
  "mixed",
  "net_new",
  "multilingual",
] as const;
export const TECHNICAL_COMPLEXITIES = [
  "basic",
  "integrations",
  "complex",
  "regulated",
] as const;
export const TIMELINE_URGENCY = [
  "relaxed",
  "standard",
  "rush",
  "critical",
] as const;
export const MAINTENANCE_LEVELS = [
  "none",
  "light",
  "standard",
  "retainer",
] as const;

export type DesignComplexity = (typeof DESIGN_COMPLEXITIES)[number];
export type FunctionalityComplexity = (typeof FUNCTIONALITY_COMPLEXITIES)[number];
export type ContentComplexity = (typeof CONTENT_COMPLEXITIES)[number];
export type TechnicalComplexity = (typeof TECHNICAL_COMPLEXITIES)[number];
export type TimelineUrgency = (typeof TIMELINE_URGENCY)[number];
export type MaintenanceLevel = (typeof MAINTENANCE_LEVELS)[number];

export type TierLookup = LandingPageTier | SmallBusinessTier | EcommerceTier | WebAppTier;

export interface ComplexityMultipliers {
  design: DesignComplexity;
  functionality: FunctionalityComplexity;
  content: ContentComplexity;
  technical: TechnicalComplexity;
  timeline: TimelineUrgency;
}

export interface CalculationInput {
  projectType: ProjectType;
  tier: TierLookup;
  hourlyRate: number;
  multipliers: ComplexityMultipliers;
  maintenance: MaintenanceLevel;
  assumptions?: string;
}

export interface AiAdjustmentMetadata {
  source: string;
  complexityScore: number;
  confidence: number;
  globalMultiplier: number;
  overridesApplied: Partial<ComplexityMultipliers>;
  highlights?: string[];
  risks?: string[];
  rationale?: string;
}

export interface DeterministicSnapshot {
  totalHours: number;
  totalCost: number;
}

export interface LineItem {
  id: string;
  label: string;
  hours: number;
  cost: number;
  description: string;
}

export interface CalculationResult {
  totalHours: number;
  totalCost: number;
  effectiveHourlyRate: number;
  maintenanceHours: number;
  maintenanceCost: number;
  baseHours: number;
  factors: {
    design: number;
    functionality: number;
    content: number;
    technical: number;
    timeline: number;
  };
  multipliersApplied: ComplexityMultipliers;
  maintenanceLevel: MaintenanceLevel;
  projectType: ProjectType;
  tier: TierLookup;
  lineItems: LineItem[];
  assumptions?: string;
  ai?: AiAdjustmentMetadata;
  deterministicTotals?: DeterministicSnapshot;
}

