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
  CalculationInput,
  CalculationResult,
  LineItem,
  ProjectType,
  TierLookup,
} from "./types";

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

function buildLineItems(
  totalHours: number,
  hourlyRate: number,
): LineItem[] {
  return Object.entries(PHASE_ALLOCATION).map(([key, { weight, label }]) => {
    const hours = roundToTwoDecimals(totalHours * weight);
    const cost = roundToTwoDecimals(hours * hourlyRate);
    return {
      id: key,
      label,
      hours,
      cost,
      description: `Allocated ${Math.round(weight * 100)}% of total effort to ${label.toLowerCase()}.`,
    };
  });
}

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
  const adjustedHours = baseHours * complexityMultiplier * timelineFactor;
  const maintenanceHours = adjustedHours * maintenanceFactor;
  const totalHours = adjustedHours + maintenanceHours;
  const totalCost = totalHours * input.hourlyRate;

  const lineItems = buildLineItems(totalHours, input.hourlyRate);

  return {
    projectType: input.projectType,
    tier: input.tier,
    assumptions: input.assumptions,
    baseHours: roundToTwoDecimals(baseHours),
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
    lineItems,
  };
}

