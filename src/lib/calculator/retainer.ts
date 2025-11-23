import type { ComplexityTier } from "@/lib/calculator/complexity-score";
import type { MaintenanceLevel, MaintenanceScope } from "@/lib/calculator/types";

export interface RetainerPackage {
  id: "starter" | "professional" | "growth";
  label: string;
  hours: number;
  monthlyFee: number;
  description: string;
  notes: string[];
}

interface BuildRetainerArgs {
  hourlyRate: number;
  maintenanceLevel: MaintenanceLevel;
  maintenanceScope?: MaintenanceScope;
  cadence?: string;
  owner?: string;
  plan?: string;
  hostingStrategy?: string;
  complexityTier: ComplexityTier;
  hoursTarget?: number;
  sla?: string;
}

const LEVEL_HOURS: Record<MaintenanceLevel, number> = {
  none: 0,
  light: 8,
  standard: 16,
  retainer: 28,
};

const CADENCE_MULTIPLIER: Record<string, number> = {
  ad_hoc: 0.5,
  quarterly: 0.75,
  monthly: 1,
  weekly: 1.4,
};

const SCOPE_MULTIPLIER: Record<MaintenanceScope, number> = {
  core: 1,
  content_ops: 1.2,
  feature_sprints: 1.45,
};

const SLA_MULTIPLIER: Record<string, number> = {
  business_hours: 1,
  next_business_day: 1.1,
  twentyfour_seven: 1.3,
};

const VALUE_MULTIPLIER: Record<ComplexityTier, number> = {
  starter: 1,
  professional: 1.1,
  growth: 1.2,
  enterprise: 1.3,
};

const PACKAGE_BLUEPRINTS = [
  {
    id: "starter",
    label: "Starter Care",
    factor: 0.65,
    minHours: 6,
    narrative: "Baseline monitoring + CMS touch-ups.",
    valueDelta: -0.05,
  },
  {
    id: "professional",
    label: "Professional Care",
    factor: 1,
    minHours: 12,
    narrative: "Monthly optimization + new content drops.",
    valueDelta: 0,
  },
  {
    id: "growth",
    label: "Growth Partner",
    factor: 1.5,
    minHours: 20,
    narrative: "Roadmap sprints, experiments, and CRO.",
    valueDelta: 0.1,
  },
] as const;

export function buildRetainerPackages(args: BuildRetainerArgs): RetainerPackage[] {
  const scope = args.maintenanceScope ?? "core";
  const cadenceMultiplier = CADENCE_MULTIPLIER[args.cadence ?? "monthly"] ?? 1;
  const scopeMultiplier = SCOPE_MULTIPLIER[scope] ?? 1;
  const slaMultiplier = SLA_MULTIPLIER[args.sla ?? "business_hours"] ?? 1;
  const manualHours = args.hoursTarget && args.hoursTarget > 0 ? args.hoursTarget : undefined;
  const baseHours =
    (manualHours ?? LEVEL_HOURS[args.maintenanceLevel]) * cadenceMultiplier * scopeMultiplier * slaMultiplier;
  const hostingHours = args.owner === "provider" ? 1.5 : 0;
  const valueMultiplier = VALUE_MULTIPLIER[args.complexityTier];

  return PACKAGE_BLUEPRINTS.map((pkg) => {
    const hours = Math.max(pkg.minHours, (baseHours || pkg.minHours) * pkg.factor) + hostingHours;
    const adjustedMultiplier = Math.max(1, valueMultiplier + pkg.valueDelta);
    const monthlyFee = hours * args.hourlyRate * adjustedMultiplier;
    const notes: string[] = [];
    if (args.owner === "provider") {
      notes.push("Includes hosting management + uptime monitoring.");
    } else {
      notes.push("Client-hosted — retainer covers upkeep only.");
    }
    if (scope === "feature_sprints") {
      notes.push("Feature work beyond this block should be quoted as mini-projects.");
    }
    if (args.sla === "twentyfour_seven") {
      notes.push("Includes 24/7 on-call coverage per SLA.");
    } else if (args.sla === "next_business_day") {
      notes.push("Next-business-day response baked into scope.");
    }
    if (args.plan === "handoff") {
      notes.push("Upsell support retainers to protect launch quality.");
    }
    return {
      id: pkg.id,
      label: pkg.label,
      hours: round(hours),
      monthlyFee: round(monthlyFee),
      description: pkg.narrative,
      notes,
    };
  });
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}


