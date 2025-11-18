"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import type { CalculationResult, LineItem } from "@/lib/calculator/types";
import { loadCalculationResult, type CalculationMeta } from "@/lib/calculator/storage";
import type { AgencyRateSummary } from "@/lib/agency/types";
import { generateBasicPdfReport } from "@/lib/export/basic-pdf";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  FileDown,
  Loader2,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

const hoursFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

type ViewMode = "detailed" | "tiers";
type TimelineView = "gantt" | "phases";

export function ResultsExperience({
  result,
  fallbackSource = "demo",
  fallbackCurrency = "usd",
}: {
  result: CalculationResult;
  fallbackSource?: "demo" | "questionnaire" | "analysis";
  fallbackCurrency?: SupportedCurrency;
}) {
  const [baseResult, setBaseResult] = useState<CalculationResult>(result);
  const [resultSource, setResultSource] = useState(fallbackSource);
  const [meta, setMeta] = useState<CalculationMeta>({
    hourlyRate: result.effectiveHourlyRate,
    currency: fallbackCurrency,
    margin: 0.25,
    internalHourlyRate: undefined,
    agencyRateSummary: undefined,
  });
  const [margin, setMargin] = useState(meta.margin);
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");
  const [timelineView, setTimelineView] = useState<TimelineView>("gantt");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const exportStatusTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = loadCalculationResult();
    if (!stored?.result) return;
    const frame = window.requestAnimationFrame(() => {
      setBaseResult(stored.result);
      setResultSource(stored.source ?? "questionnaire");
      if (stored.meta) {
        setMeta(stored.meta);
        setMargin(stored.meta.margin);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const adjustedResult = useMemo(
    () => applyMargin(baseResult, meta.margin, margin),
    [baseResult, meta.margin, margin],
  );
  const tierRows = useMemo(() => buildTierRows(adjustedResult), [adjustedResult]);
  const confidence = Math.round((adjustedResult.ai?.confidence ?? 0.65) * 100);
  const roughWeeks = adjustedResult.totalHours / 35;
  const minWeeks = Math.max(4, Math.round(roughWeeks));
  const timelineCopy = `${minWeeks}-${minWeeks + 2} weeks`;
  const formatMoney = useCallback(
    (value: number) => formatCurrencyValue(value, meta.currency),
    [meta.currency],
  );

  const handleCopyLink = useCallback(async () => {
    try {
      const shareUrl =
        typeof window !== "undefined" ? window.location.href : "https://webflowcalc.com/results";
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2500);
    } catch (error) {
      console.warn("Failed to copy link", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  }, []);

  const scheduleExportStatusReset = useCallback(() => {
    if (typeof window === "undefined") return;
    if (exportStatusTimeout.current) {
      window.clearTimeout(exportStatusTimeout.current);
    }
    exportStatusTimeout.current = window.setTimeout(() => {
      setExportStatus("idle");
      exportStatusTimeout.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (exportStatusTimeout.current) {
        window.clearTimeout(exportStatusTimeout.current);
      }
    };
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (isExporting || typeof window === "undefined") return;
    setIsExporting(true);
    try {
      const pdfBytes = await generateBasicPdfReport({
        result: adjustedResult,
        meta: { ...meta, margin },
        source: resultSource,
      });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildExportFileName(adjustedResult);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportStatus("success");
    } catch (error) {
      console.error("Failed to export PDF", error);
      setExportStatus("error");
    } finally {
      setIsExporting(false);
      scheduleExportStatusReset();
    }
  }, [adjustedResult, meta, margin, resultSource, isExporting, scheduleExportStatusReset]);

  const exportButtonLabel = useMemo(() => {
    if (isExporting) return "Generating…";
    if (exportStatus === "success") return "PDF saved";
    if (exportStatus === "error") return "Retry export";
    return "Download PDF";
  }, [exportStatus, isExporting]);

  const exportFeedback =
    exportStatus === "error"
      ? "Export failed. Please retry."
      : exportStatus === "success"
        ? "PDF downloaded to your device."
        : null;

  const handleToggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-white/[0.04]">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary/80">
                Estimate summary
              </p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                {formatMoney(adjustedResult.totalCost)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {hoursFormatter.format(adjustedResult.totalHours)} hours · Tier{" "}
                {adjustedResult.tier.toString().replace(/_/g, " ")}
              </p>
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Pricing currency: {meta.currency.toUpperCase()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedControl
                  label="View mode"
                  value={viewMode}
                  options={[
                    { label: "Detailed", value: "detailed" },
                    { label: "Tiered", value: "tiers" },
                  ]}
                  onChange={(value) => setViewMode(value as ViewMode)}
                />
                <SegmentedControl
                  label="Timeline"
                  value={timelineView}
                  options={[
                    { label: "Gantt", value: "gantt" },
                    { label: "Phases", value: "phases" },
                  ]}
                  onChange={(value) => setTimelineView(value as TimelineView)}
                />
                <Button
                  variant="outline"
                  className="gap-2 border-white/20 text-sm"
                  onClick={handleCopyLink}
                >
                  {copyStatus === "copied" ? (
                    <>
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>
                <Button
                  className="gap-2 bg-primary text-primary-foreground"
                  onClick={handleExportPdf}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4" />
                  )}
                  {exportButtonLabel}
                </Button>
              </div>
              {exportFeedback && (
                <p
                  className={cn(
                    "text-xs",
                    exportStatus === "error" ? "text-red-400" : "text-emerald-400",
                  )}
                >
                  {exportFeedback}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryStat
              label="Timeline"
              value={timelineCopy}
              helper="Based on total hours + 2 sprint buffer"
            />
            <SummaryStat
              label="Hourly rate"
              value={`${formatMoney(meta.hourlyRate)} / hr`}
            helper={
              meta.internalHourlyRate
                ? `Internal cost ${formatMoney(meta.internalHourlyRate)}`
                : "Adjust via questionnaire or margin slider"
            }
            />
            <SummaryStat
              label="Maintenance"
              value={formatMoney(adjustedResult.maintenanceCost)}
              helper={`${hoursFormatter.format(adjustedResult.maintenanceHours)} hours / mo`}
            />
            <SummaryStat
              label="Confidence"
              value={`${confidence}%`}
              helper={adjustedResult.ai?.rationale ?? "Blend of deterministic + historical benchmarks"}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(adjustedResult.factors).map(([key, factor]) => (
              <span
                key={key}
                className="rounded-full border border-white/15 px-3 py-1 uppercase tracking-[0.3em] text-muted-foreground"
              >
                {key}: {factor.toFixed(2)}x
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="flex flex-col gap-3 border-b border-white/5 pb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-primary/70">
                  Cost breakdown
                </p>
                <CardTitle>Where the hours go</CardTitle>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Switch between detailed line items and tiered summary. Expand each section for
              rationale and included tasks.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {viewMode === "detailed" ? (
              <DetailedBreakdown
                lineItems={adjustedResult.lineItems}
                expanded={expanded}
                onToggle={handleToggle}
                formatCurrency={formatMoney}
              />
            ) : (
              <TierView tiers={tierRows} formatCurrency={formatMoney} />
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <TimelineCard
            lineItems={adjustedResult.lineItems}
            totalHours={adjustedResult.totalHours}
            view={timelineView}
            formatCurrency={formatMoney}
          />
          <MarginControl
            margin={margin}
            baseline={meta.margin}
            currencyFormatter={formatMoney}
            totalCost={adjustedResult.totalCost}
            onChange={setMargin}
          />
          {meta.agencyRateSummary && (
            <AgencyEconomicsCard
              summary={meta.agencyRateSummary}
              formatCurrency={formatMoney}
            />
          )}
          <InsightCard result={adjustedResult} source={resultSource} />
          <ShareNote />
        </aside>
      </div>
    </div>
  );
}

function AgencyEconomicsCard({
  summary,
  formatCurrency,
}: {
  summary: AgencyRateSummary;
  formatCurrency: (value: number) => string;
}) {
  const visibleMembers = summary.teamSnapshot.slice(0, 3);
  const extraCount = summary.teamSnapshot.length - visibleMembers.length;

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Agency economics</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Internal blended rate vs client-facing quote and roster snapshot.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-3">
          <MiniStat label="Internal cost" value={`${formatCurrency(summary.blendedCostRate)} / hr`} />
          <MiniStat
            label="Client quote"
            value={`${formatCurrency(summary.recommendedBillableRate)} / hr`}
            helper={`Margin ${(summary.margin * 100).toFixed(0)}%`}
          />
          <MiniStat
            label="Weekly capacity"
            value={`${summary.totalWeeklyCapacity} hrs`}
            helper={`${summary.memberCount} roles`}
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Team roster</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {visibleMembers.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3">
                <span className="text-white">{member.name || member.role}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(member.costRate)} → $
                  {(member.billableRate ?? member.costRate * 2).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>
          {extraCount > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              +{extraCount} more role{extraCount > 1 ? "s" : ""} tracked
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-full border border-white/15 bg-white/[0.03] p-1 text-xs text-muted-foreground">
      <span className="sr-only">{label}</span>
      <div className="flex gap-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-full px-3 py-1 transition",
                active ? "bg-primary text-primary-foreground" : "hover:text-white",
              )}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailedBreakdown({
  lineItems,
  expanded,
  onToggle,
  formatCurrency,
}: {
  lineItems: LineItem[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="space-y-3">
      {lineItems.map((item) => {
        const isOpen = expanded[item.id];
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => onToggle(item.id)}
            >
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {hoursFormatter.format(item.hours)} hrs · {formatCurrency(item.cost)}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-muted-foreground">
                {item.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TierView({
  tiers,
  formatCurrency,
}: {
  tiers: Array<{ id: string; label: string; description: string; cost: number; hours: number }>;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => (
        <div key={tier.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70">{tier.label}</p>
          <p className="text-2xl font-semibold text-white">{formatCurrency(tier.cost)}</p>
          <p className="text-xs text-muted-foreground">
            {hoursFormatter.format(tier.hours)} hrs
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineCard({
  lineItems,
  totalHours,
  view,
  formatCurrency,
}: {
  lineItems: LineItem[];
  totalHours: number;
  view: TimelineView;
  formatCurrency: (value: number) => string;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Timeline</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Sequenced estimate including QA & launch buffer.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {view === "gantt" ? (
          <div className="space-y-3">
            {lineItems.map((item, index) => {
              const start =
                lineItems.slice(0, index).reduce((acc, current) => acc + current.hours, 0) /
                totalHours;
              const width = item.hours / totalHours;
              return (
                <div key={item.id} className="text-sm">
                  <p className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.label}</span>
                    <span>{hoursFormatter.format(item.hours)} hrs</span>
                  </p>
                  <div className="relative h-3 rounded-full bg-white/10">
                    <div
                      className="absolute h-3 rounded-full bg-primary"
                      style={{
                        left: `${start * 100}%`,
                        width: `${Math.max(width * 100, 8)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-3 text-sm text-muted-foreground">
            {lineItems.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-white">{item.label}</p>
                <p className="text-xs">
                  {hoursFormatter.format(item.hours)} hrs · {formatCurrency(item.cost)}
                </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({
  result,
  source,
}: {
  result: CalculationResult;
  source: string;
}) {
  const highlights =
    result.ai?.highlights ??
    [
      "Custom design system with immersive interactions",
      "HubSpot + marketing automation integration",
      "Content refresh for 12 layouts + blog templates",
    ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Scope notes</CardTitle>
        </div>
        <p className="text-xs text-primary/80">
          {source === "demo"
            ? "Sample data (run a calculation to personalize)"
            : "Captured during questionnaire + AI insight"}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-white">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {result.ai?.risks && result.ai.risks.length > 0 && (
        <CardFooter className="pt-2">
          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/90">
            <p className="font-semibold">Risks to monitor:</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {result.ai.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function ShareNote() {
  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Share-ready</CardTitle>
        <p className="text-xs text-muted-foreground">
          Copy the public link or export a PDF whenever you are ready to share with stakeholders.
        </p>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        <ul className="space-y-2">
          <li>• Copy link for async reviews</li>
          <li>• Export PDF (watermark removed on Pro)</li>
          <li>• Embed results in proposals</li>
        </ul>
      </CardContent>
    </Card>
  );
}

function MarginControl({
  margin,
  baseline,
  currencyFormatter,
  totalCost,
  onChange,
}: {
  margin: number;
  baseline: number;
  currencyFormatter: (value: number) => string;
  totalCost: number;
  onChange: (value: number) => void;
}) {
  const percentage = Math.round(margin * 100);
  const diff = margin - baseline;
  const diffLabel =
    Math.abs(diff) < 0.005
      ? "Baseline margin"
      : diff > 0
        ? `+${Math.round(diff * 100)} pts over baseline`
        : `${Math.round(diff * 100)} pts under baseline`;

  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Adjust profit margin</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Fine-tune markup without re-running the calculation engine.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white">{percentage}%</span>
          <span className="text-xs text-muted-foreground">{diffLabel}</span>
        </div>
        <input
          type="range"
          min={0.05}
          max={0.6}
          step={0.01}
          value={margin}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-xs text-muted-foreground">
          New total: {currencyFormatter(totalCost)} (updates summary + line items)
        </p>
      </CardContent>
    </Card>
  );
}

function buildTierRows(result: CalculationResult) {
  const presets = [
    {
      id: "lean",
      label: "Lean MVP",
      description: "Prioritize launch-critical pages + baseline interactions.",
      factor: 0.82,
    },
    {
      id: "recommended",
      label: "Recommended scope",
      description: "Balanced polish, animations, and CMS coverage.",
      factor: 1,
    },
    {
      id: "premium",
      label: "Premium",
      description: "Full storytelling, advanced localization, and retained QA.",
      factor: 1.22,
    },
  ] as const;

  return presets.map((preset) => ({
    ...preset,
    cost: result.totalCost * preset.factor,
    hours: result.totalHours * preset.factor,
  }));
}

const CURRENCY_CODES: Record<SupportedCurrency, "USD" | "EUR" | "GBP"> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};

function formatCurrencyValue(value: number, currency: SupportedCurrency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY_CODES[currency],
    maximumFractionDigits: 0,
  }).format(value);
}

function applyMargin(
  base: CalculationResult,
  baselineMargin: number,
  currentMargin: number,
): CalculationResult {
  const delta = currentMargin - baselineMargin;
  if (Math.abs(delta) < 0.001) {
    return base;
  }
  const factor = 1 + delta;
  const totalCost = round(base.totalCost * factor);
  const maintenanceCost = round(base.maintenanceCost * factor);
  const effectiveHourlyRate = round(
    (totalCost / base.totalHours) || base.effectiveHourlyRate,
    2,
  );
  return {
    ...base,
    totalCost,
    maintenanceCost,
    effectiveHourlyRate,
    lineItems: base.lineItems.map((item) => ({
      ...item,
      cost: round(item.cost * factor),
    })),
  };
}

function round(value: number, decimals = 0) {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function buildExportFileName(result: CalculationResult) {
  const slug = `${result.projectType}-${result.tier}`.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "");
  const date = new Date().toISOString().slice(0, 10);
  return `webflow-estimate-${slug}-${date}.pdf`;
}


