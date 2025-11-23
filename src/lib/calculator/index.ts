import {
  DESIGN_MULTIPLIERS,
  FUNCTIONALITY_MULTIPLIERS,
  CONTENT_MULTIPLIERS,
  TECHNICAL_MULTIPLIERS,
  TIMELINE_MULTIPLIERS,
  MAINTENANCE_FACTORS,
  PROJECT_BASE_HOURS,
  PHASE_ALLOCATION,
} from "./config";
import type {
  AddonSummary,
  CalculationInput,
  CalculationResult,
  LineItem,
  ProjectType,
  TierLookup,
} from "./types";
import { buildRetainerPackages } from "./retainer";

function assertTier(projectType: ProjectType, tier: TierLookup): number {
  const tiers = PROJECT_BASE_HOURS[projectType];
  const baseHours = tiers?.[tier];

  if (!baseHours) {
    const availableTiers = Object.keys(tiers || {}).join(", ");
    throw new Error(
      `Tier "${tier}" is not valid for ${projectType}. Expected one of: ${availableTiers}`,
    );
  }

  return baseHours;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildLineItems(hoursPool: number, hourlyRate: number): LineItem[] {
  return Object.entries(PHASE_ALLOCATION).map(([key, { weight, label }]) => {
    const hours = roundToTwoDecimals(hoursPool * weight);
    const cost = roundToTwoDecimals(hours * hourlyRate);
    return {
      id: key,
      label,
      hours,
      cost,
      description: `Allocated ${Math.round(weight * 100)}% of production effort to ${label.toLowerCase()}.`,
    };
  });
}

function scaleLineItems(items: LineItem[], factor: number, hourlyRate: number): LineItem[] {
  if (Math.abs(factor - 1) < 0.001) {
    return items;
  }
  return items.map((item) => {
    const hours = roundToTwoDecimals(item.hours * factor);
    return {
      ...item,
      hours,
      cost: roundToTwoDecimals(hours * hourlyRate),
    };
  });
}

function scaleAddons(addons: AddonSummary[], factor: number, hourlyRate: number): AddonSummary[] {
  if (Math.abs(factor - 1) < 0.001) {
    return addons;
  }
  return addons.map((addon) => {
    const hours = roundToTwoDecimals(addon.hours * factor);
    return {
      ...addon,
      hours,
      cost: roundToTwoDecimals(hours * hourlyRate),
    };
  });
}

const TIMELINE_ADDON_META: Record<
  CalculationInput["multipliers"]["timeline"],
  { label: string; description: string }
> = {
  relaxed: {
    label: "Flexible timeline buffer",
    description: "Additional reviews + schedule slack baked into the plan.",
  },
  standard: {
    label: "Standard launch cadence",
    description: "Typical 6-8 week cadence with cross-team reviews.",
  },
  rush: {
    label: "Rush coordination",
    description: "Dedicated PM + QA cycles to hit accelerated launch windows.",
  },
  critical: {
    label: "Critical-path war room",
    description: "Daily checkpoints and contingency staffing for immovable deadlines.",
  },
};

export function calculateCost(input: CalculationInput): CalculationResult {
  const baseHours = assertTier(input.projectType, input.tier);
  const designFactor = DESIGN_MULTIPLIERS[input.multipliers.design];
  const functionalityFactor =
    FUNCTIONALITY_MULTIPLIERS[input.multipliers.functionality];
  const contentFactor = CONTENT_MULTIPLIERS[input.multipliers.content];
  const technicalFactor = TECHNICAL_MULTIPLIERS[input.multipliers.technical];
  const timelineFactor = TIMELINE_MULTIPLIERS[input.multipliers.timeline];
  const maintenanceFactor = MAINTENANCE_FACTORS[input.maintenance];

  const complexityMultiplier =
    designFactor * functionalityFactor * contentFactor * technicalFactor;
  const basePhaseHours = baseHours * complexityMultiplier;
  const timelineExtraHours = Math.max(0, basePhaseHours * (timelineFactor - 1));
  const featureAddons = input.addons ?? [];
  const featureAddonHours = featureAddons.reduce((sum, addon) => sum + addon.hours, 0);
  const executionHours = basePhaseHours + timelineExtraHours + featureAddonHours;
  const bufferPercentage = input.complexity?.bufferPercentage ?? 0.2;
  const bufferHours = executionHours * bufferPercentage;
  const productionHours = executionHours + bufferHours;
  const bufferFactor = executionHours === 0 ? 1 : productionHours / executionHours;
  const maintenanceHours = productionHours * maintenanceFactor;
  const totalHours = productionHours + maintenanceHours;
  const totalCost = totalHours * input.hourlyRate;
  const bufferCost = bufferHours * input.hourlyRate;

  const phaseItems = buildLineItems(basePhaseHours, input.hourlyRate).map((item) => ({
    ...item,
    kind: "phase" as const,
  }));

  const timelineAddon: AddonSummary | null =
    timelineExtraHours > 0
      ? {
          id: `timeline:${input.multipliers.timeline}`,
          label: TIMELINE_ADDON_META[input.multipliers.timeline].label,
          category: "timeline",
          driver: "timeline_urgency",
          hours: roundToTwoDecimals(timelineExtraHours),
          cost: roundToTwoDecimals(timelineExtraHours * input.hourlyRate),
          description: TIMELINE_ADDON_META[input.multipliers.timeline].description,
        }
      : null;

  const addonSummaries: AddonSummary[] = [
    ...(timelineAddon ? [timelineAddon] : []),
    ...featureAddons.map((addon) => ({
      id: `addon:${addon.id}`,
      label: addon.label,
      category: addon.category,
      driver: addon.driver,
      hours: roundToTwoDecimals(addon.hours),
      cost: roundToTwoDecimals(addon.hours * input.hourlyRate),
      description: addon.description,
    })),
  ];

  const scaledPhaseItems = scaleLineItems(phaseItems, bufferFactor, input.hourlyRate);
  const scaledAddons = scaleAddons(addonSummaries, bufferFactor, input.hourlyRate);
  const addonLineItems: LineItem[] = scaledAddons.map((addon) => ({
    id: addon.id,
    label: addon.label,
    hours: addon.hours,
    cost: addon.cost,
    description: addon.description,
    kind: addon.category === "timeline" ? "timeline" : "addon",
    category: addon.category,
  }));

  const lineItems = [...scaledPhaseItems, ...addonLineItems];

  const retainers = buildRetainerPackages({
    hourlyRate: input.hourlyRate,
    maintenanceLevel: input.maintenance,
    maintenanceScope: input.maintenanceScope ?? "core",
    cadence: input.retainerContext?.cadence,
    owner: input.retainerContext?.owner,
    plan: input.retainerContext?.plan,
    hostingStrategy: input.retainerContext?.hostingStrategy,
    complexityTier: input.complexity.tier,
  });

  return {
    projectType: input.projectType,
    tier: input.tier,
    assumptions: input.assumptions,
    baseHours: roundToTwoDecimals(baseHours),
    productionHours: roundToTwoDecimals(productionHours),
    bufferHours: roundToTwoDecimals(bufferHours),
    bufferCost: roundToTwoDecimals(bufferCost),
    bufferPercentage,
    totalHours: roundToTwoDecimals(totalHours),
    totalCost: roundToTwoDecimals(totalCost),
    effectiveHourlyRate: roundToTwoDecimals(totalCost / totalHours),
    maintenanceHours: roundToTwoDecimals(maintenanceHours),
    maintenanceCost: roundToTwoDecimals(maintenanceHours * input.hourlyRate),
    factors: {
      design: designFactor,
      functionality: functionalityFactor,
      content: contentFactor,
      technical: technicalFactor,
      timeline: timelineFactor,
    },
    multipliersApplied: input.multipliers,
    maintenanceLevel: input.maintenance,
    maintenanceScope: input.maintenanceScope,
    complexity: input.complexity,
    addons: scaledAddons,
    retainers,
    lineItems,
  };
}

