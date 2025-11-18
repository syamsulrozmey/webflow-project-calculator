import type { CalculationMeta } from "@/lib/calculator/storage";
import type { CalculationResult, LineItem, SupportedCurrency } from "@/lib/calculator/types";
import type { FeatureTier } from "@/lib/export/feature-tier";

const DEFAULT_SCOPE_NOTES = [
  "Custom design system with immersive interactions",
  "HubSpot + marketing automation integration",
  "Content refresh for 12 layouts + blog templates",
];

const FACTOR_LABELS: Record<keyof CalculationResult["factors"], string> = {
  design: "Design",
  functionality: "Functionality",
  content: "Content",
  technical: "Technical",
  timeline: "Timeline",
};

const SOURCE_LABELS: Record<string, string> = {
  questionnaire: "Questionnaire responses",
  analysis: "Existing site analysis",
  demo: "Demo dataset",
};

const CURRENCY_CODES: Record<SupportedCurrency, "USD" | "EUR" | "GBP"> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};

export interface PdfSummaryStat {
  label: string;
  value: string;
  helper?: string;
}

export interface PdfBreakdownRow {
  id: string;
  label: string;
  hoursLabel: string;
  costLabel: string;
  description: string;
  percent: number;
}

export interface PdfTimelineEntry {
  id: string;
  label: string;
  hoursLabel: string;
  startPercent: number;
  widthPercent: number;
  narrative: string;
}

export interface PdfScopeSection {
  highlights: string[];
  assumptions: string[];
  risks: string[];
}

export interface PdfAgencySection {
  blendedCostRate: string;
  recommendedBillableRate: string;
  margin: string;
  totalWeeklyCapacity: string;
  memberCount: number;
  teamSnapshot: Array<{ id: string; name: string; role: string; rateLabel: string }>;
}

export interface PdfFactorEntry {
  label: string;
  value: string;
}

export interface PdfHeaderSection {
  title: string;
  subtitle: string;
  issuedOn: string;
  currency: string;
  tier: FeatureTier;
  projectDescriptor: string;
  source: string;
  watermarkText?: string;
}

export interface BasicPdfSections {
  header: PdfHeaderSection;
  summary: PdfSummaryStat[];
  breakdown: PdfBreakdownRow[];
  timeline: PdfTimelineEntry[];
  factors: PdfFactorEntry[];
  scope: PdfScopeSection;
  agency?: PdfAgencySection;
}

export interface BuildBasicPdfSectionsArgs {
  result: CalculationResult;
  meta: CalculationMeta;
  tier: FeatureTier;
  source?: "demo" | "questionnaire" | "analysis";
  issuedAt?: Date;
}

export function buildBasicPdfSections({
  result,
  meta,
  tier,
  source = "questionnaire",
  issuedAt = new Date(),
}: BuildBasicPdfSectionsArgs): BasicPdfSections {
  const hoursFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  });
  const currencyFormatter = getCurrencyFormatter(meta.currency);

  const tierLabel = toTitleCase(result.tier.replace(/_/g, " "));
  const projectDescriptor = `${toTitleCase(result.projectType.replace(/_/g, " "))} · ${tierLabel}`;
  const totalLabel = currencyFormatter.format(result.totalCost);
  const maintenanceLabel = `${hoursFormatter.format(result.maintenanceHours)} hrs / mo`;
  const timelineRange = buildTimelineRange(result.totalHours);
  const confidence = Math.round((result.ai?.confidence ?? 0.65) * 100);
  const summary: PdfSummaryStat[] = [
    {
      label: "Total cost",
      value: totalLabel,
      helper: `${hoursFormatter.format(result.totalHours)} hours total`,
    },
    {
      label: "Hourly rate",
      value: `${currencyFormatter.format(meta.hourlyRate)} / hr`,
      helper: meta.internalHourlyRate
        ? `Internal cost ${currencyFormatter.format(meta.internalHourlyRate)}`
        : undefined,
    },
    {
      label: "Timeline",
      value: timelineRange,
      helper: "Includes QA + launch buffer",
    },
    {
      label: "Maintenance",
      value: currencyFormatter.format(result.maintenanceCost),
      helper: maintenanceLabel,
    },
    {
      label: "Confidence",
      value: `${confidence}%`,
      helper: result.ai?.rationale ?? "Blend of deterministic engine + benchmarks",
    },
  ];

  const breakdown = buildBreakdownRows(result.lineItems, result.totalHours, currencyFormatter, hoursFormatter);
  const timeline = buildTimelineEntries(result.lineItems, result.totalHours, currencyFormatter, hoursFormatter);
  const factors = buildFactorEntries(result);
  const scope = buildScopeSection(result);
  const agency = buildAgencySection(meta, currencyFormatter);

  return {
    header: {
      title: "Webflow Project Estimate",
      subtitle: totalLabel,
      issuedOn: formatIssuedOn(issuedAt),
      currency: meta.currency.toUpperCase(),
      tier,
      projectDescriptor,
      source: SOURCE_LABELS[source] ?? "Questionnaire responses",
      watermarkText: tier === "free" ? "Webflow Calculator · Free Tier" : undefined,
    },
    summary,
    breakdown,
    timeline,
    factors,
    scope,
    agency,
  };
}

function buildBreakdownRows(
  items: LineItem[],
  totalHours: number,
  currencyFormatter: Intl.NumberFormat,
  hoursFormatter: Intl.NumberFormat,
): PdfBreakdownRow[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    hoursLabel: `${hoursFormatter.format(item.hours)} hrs`,
    costLabel: currencyFormatter.format(item.cost),
    description: item.description,
    percent: Math.round((item.hours / totalHours) * 100),
  }));
}

function buildTimelineEntries(
  items: LineItem[],
  totalHours: number,
  currencyFormatter: Intl.NumberFormat,
  hoursFormatter: Intl.NumberFormat,
): PdfTimelineEntry[] {
  let cumulative = 0;
  return items.map((item) => {
    const startPercent = totalHours === 0 ? 0 : (cumulative / totalHours) * 100;
    const rawWidthPercent = totalHours === 0 ? 0 : (item.hours / totalHours) * 100;
    const widthPercent = Math.max(Math.min(Math.round(rawWidthPercent), 100), 4);
    cumulative += item.hours;
    return {
      id: item.id,
      label: item.label,
      hoursLabel: `${hoursFormatter.format(item.hours)} hrs · ${currencyFormatter.format(item.cost)}`,
      startPercent: Math.round(startPercent),
      widthPercent,
      narrative: `Begins around week ${estimateWeek(startPercent)} — ${rawWidthPercent.toFixed(
        0,
      )}% of total effort.`,
    };
  });
}

function buildFactorEntries(result: CalculationResult): PdfFactorEntry[] {
  return Object.entries(result.factors).map(([key, value]) => ({
    label: FACTOR_LABELS[key as keyof CalculationResult["factors"]] ?? key,
    value: `${value.toFixed(2)}x`,
  }));
}

function buildScopeSection(result: CalculationResult): PdfScopeSection {
  const highlights = result.ai?.highlights?.length ? result.ai.highlights : DEFAULT_SCOPE_NOTES;
  const risks = result.ai?.risks ?? [];
  const assumptions = result.assumptions
    ? result.assumptions
        .split(/\n+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

  return { highlights, risks, assumptions };
}

function buildAgencySection(
  meta: CalculationMeta,
  currencyFormatter: Intl.NumberFormat,
): PdfAgencySection | undefined {
  if (!meta.agencyRateSummary) {
    return undefined;
  }
  const snapshot = meta.agencyRateSummary.teamSnapshot.slice(0, 5);
  return {
    blendedCostRate: `${currencyFormatter.format(meta.agencyRateSummary.blendedCostRate)} / hr`,
    recommendedBillableRate: `${currencyFormatter.format(meta.agencyRateSummary.recommendedBillableRate)} / hr`,
    margin: `${Math.round(meta.agencyRateSummary.margin * 100)}%`,
    totalWeeklyCapacity: `${meta.agencyRateSummary.totalWeeklyCapacity} hrs`,
    memberCount: meta.agencyRateSummary.memberCount,
    teamSnapshot: snapshot.map((member) => ({
      id: member.id,
      name: member.name || member.role,
      role: member.role,
      rateLabel: `${currencyFormatter.format(member.costRate)} -> ${currencyFormatter.format(
        member.billableRate ?? member.costRate * 2,
      )}`,
    })),
  };
}

function buildTimelineRange(totalHours: number): string {
  const roughWeeks = totalHours / 35;
  const minWeeks = Math.max(4, Math.round(roughWeeks));
  return `${minWeeks}-${minWeeks + 2} weeks`;
}

function estimateWeek(startPercent: number): number {
  return Math.max(1, Math.round((startPercent / 100) * 8));
}

function formatIssuedOn(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getCurrencyFormatter(currency: SupportedCurrency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_CODES[currency],
    maximumFractionDigits: 0,
  });
}


