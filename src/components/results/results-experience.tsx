"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type SVGProps,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SupportedCurrency } from "@/lib/calculator/from-answers";
import type { CalculationResult, LineItem, MaintenanceScope } from "@/lib/calculator/types";
import { loadCalculationResult, type CalculationMeta } from "@/lib/calculator/storage";
import type { AgencyRateSummary } from "@/lib/agency/types";
import { selectPaymentPlan } from "@/lib/calculator/payment-plan";
import { generateBasicPdfReport } from "@/lib/export/basic-pdf";
import { cn } from "@/lib/utils";
import { formatFxRelativeTime, useCurrencyRates } from "@/hooks/use-currency-rates";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock3,
  FileDown,
  Gauge,
  Layers3,
  Loader2,
  PlugZap,
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
  const {
    rates: currencyRates,
    loading: isCurrencyRatesLoading,
    error: currencyError,
  } = useCurrencyRates();

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
  const roughWeeks = adjustedResult.productionHours / 35;
  const minWeeks = Math.max(4, Math.round(roughWeeks));
  const timelineCopy = `${minWeeks}-${minWeeks + 2} weeks`;
  const maintenancePercent =
    adjustedResult.totalHours > 0
      ? adjustedResult.maintenanceHours / adjustedResult.totalHours
      : 0;
  const bufferPercentLabel = Math.round(adjustedResult.bufferPercentage * 100);
  const maintenanceScope = adjustedResult.maintenanceScope ?? "core";
  const maintenanceWarning =
    adjustedResult.maintenanceHours > 25 || maintenancePercent > 0.2;
  const hourlyBenchmarkCopy = useMemo(() => {
    const rate = meta.hourlyRate;
    if (rate < 60) {
      return "Below the researched $75-$125/hr sweet spot; consider raising for sustainability.";
    }
    if (rate <= 125) {
      return "Within the $75-$125/hr freelancer/agency sweet spot cited in the 2025 guide.";
    }
    if (rate <= 175) {
      return "Aligned with boutique agency benchmarks ($100-$150/hr).";
    }
    return "Premium enterprise positioning ($150+/hr) — communicate the added value.";
  }, [meta.hourlyRate]);
  const formatMoney = useCallback(
    (value: number) => formatCurrencyValue(value, meta.currency),
    [meta.currency],
  );
  const currencyMetaLabel = useMemo(() => {
    if (isCurrencyRatesLoading) {
      return "Syncing FX…";
    }
    if (currencyError) {
      return currencyError;
    }
    if (currencyRates) {
      const freshness = formatFxRelativeTime(currencyRates);
      return `${currencyRates.stale ? "Cached" : "Live"} FX · ${freshness ?? "synced"}`;
    }
    return null;
  }, [currencyError, currencyRates, isCurrencyRatesLoading]);

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
              <p className="text-xs text-primary/80">
                Estimate summary
              </p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                {formatMoney(adjustedResult.totalCost)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {hoursFormatter.format(adjustedResult.totalHours)} hours · Tier{" "}
                {adjustedResult.tier.toString().replace(/_/g, " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Pricing currency: {meta.currency.toUpperCase()}
                {currencyMetaLabel ? <> · {currencyMetaLabel}</> : null}
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryStat
              label="Timeline"
              value={timelineCopy}
              helper="Based on production hours + 2 sprint buffer"
            />
            <SummaryStat
              label="Hourly rate"
              value={`${formatMoney(meta.hourlyRate)} / hr`}
            helper={
              meta.internalHourlyRate
                ? `${hourlyBenchmarkCopy} · Internal cost ${formatMoney(meta.internalHourlyRate)}`
                : hourlyBenchmarkCopy
            }
            />
            <SummaryStat
              label="Maintenance"
              value={formatMoney(adjustedResult.maintenanceCost)}
              helper={
                maintenanceWarning
                  ? `${hoursFormatter.format(adjustedResult.maintenanceHours)} hrs/mo · scope as mini-project`
                  : `${hoursFormatter.format(adjustedResult.maintenanceHours)} hours / mo`
              }
            />
            <SummaryStat
              label="Contingency"
              value={`${formatMoney(adjustedResult.bufferCost)} · ${bufferPercentLabel}%`}
              helper={`${hoursFormatter.format(adjustedResult.bufferHours)} hrs reserved for revisions + QA`}
            />
            <SummaryStat
              label="Margin"
              value={`${Math.round(margin * 100)}%`}
              helper={
                Math.abs(margin - meta.margin) < 0.005
                  ? "Baseline margin"
                  : margin > meta.margin
                    ? `+${Math.round((margin - meta.margin) * 100)} pts over baseline`
                    : `${Math.round((margin - meta.margin) * 100)} pts under baseline`
              }
            />
          </div>
          <ComplexityCard
            complexity={adjustedResult.complexity}
            bufferHours={adjustedResult.bufferHours}
            bufferCost={adjustedResult.bufferCost}
            bufferPercent={bufferPercentLabel}
            formatMoney={formatMoney}
          />
        <MaintenanceGuidance
          maintenanceHours={adjustedResult.maintenanceHours}
          maintenanceCost={adjustedResult.maintenanceCost}
          totalHours={adjustedResult.totalHours}
          maintenanceScope={maintenanceScope}
          maintenancePercent={maintenancePercent}
          maintenanceWarning={maintenanceWarning}
          formatMoney={formatMoney}
        />
          <MarginControl
            margin={margin}
            baseline={meta.margin}
            currencyFormatter={formatMoney}
            totalCost={adjustedResult.totalCost}
            onChange={setMargin}
          />
          <PaymentMilestonesCard totalCost={adjustedResult.totalCost} formatCurrency={formatMoney} />

          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(adjustedResult.factors).map(([key, factor]) => (
              <span
                key={key}
                className="rounded-full border border-white/15 px-3 py-1 text-muted-foreground"
              >
                {key}: {factor.toFixed(2)}x
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {adjustedResult.retainers.length > 0 && (
        <RetainerCard packages={adjustedResult.retainers} formatCurrency={formatMoney} />
      )}

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="flex flex-col gap-3 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-primary/70">
                Cost breakdown
              </p>
              <CardTitle>Where the hours go</CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Switch between detailed line items and tiered summary. Expand each section for rationale
            and included tasks.
          </p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <section className="space-y-4">
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
          </section>

          {adjustedResult.addons.length > 0 && (
            <section className="space-y-4 border-t border-white/5 pt-6">
              <SectionHeader
                icon={PlugZap}
                title="Add-ons & modules"
                description="Transparent hours for integrations, localization, training, and rush coordination pulled from your answers."
              />
              <AddonGrid addons={adjustedResult.addons} formatCurrency={formatMoney} />
            </section>
          )}

          <section className="space-y-4 border-t border-white/5 pt-6">
            <SectionHeader
              icon={Clock3}
              title="Timeline"
              description="Sequenced estimate including QA & launch buffer."
            />
            <TimelineCard
              lineItems={adjustedResult.lineItems}
              totalHours={adjustedResult.productionHours}
              view={timelineView}
              formatCurrency={formatMoney}
            />
          </section>

          {meta.agencyRateSummary && (
            <section className="space-y-4 border-t border-white/5 pt-6">
              <SectionHeader
                icon={Users}
                title="Agency economics"
                description="Internal blended rate vs client-facing quote and roster snapshot."
              />
              <AgencyEconomicsCard
                summary={meta.agencyRateSummary}
                formatCurrency={formatMoney}
                currencySymbol={meta.currency === "eur" ? "€" : meta.currency === "gbp" ? "£" : "$"}
              />
            </section>
          )}

          <section className="space-y-4 border-t border-white/5 pt-6">
            <SectionHeader
              icon={Sparkles}
              title="Scope notes"
              description="Captured during questionnaire + AI insight."
            />
            <InsightCard
              result={adjustedResult}
              source={resultSource}
              className="w-full"
            />
          </section>

          <section className="space-y-4 border-t border-white/5 pt-6">
            <SectionHeader
              icon={Share2}
              title="Share-ready"
              description="Copy the public link or export a PDF whenever you are ready to share with stakeholders."
            />
            <ShareNote />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function AgencyEconomicsCard({
  summary,
  formatCurrency,
  currencySymbol,
}: {
  summary: AgencyRateSummary;
  formatCurrency: (value: number) => string;
  currencySymbol: string;
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
          <p className="text-xs text-muted-foreground">Team roster</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {visibleMembers.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3">
                <span className="text-white">{member.name || member.role}</span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(member.costRate)} → {currencySymbol}
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
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function ComplexityCard({
  complexity,
  bufferHours,
  bufferCost,
  bufferPercent,
  formatMoney,
}: {
  complexity: CalculationResult["complexity"];
  bufferHours: number;
  bufferCost: number;
  bufferPercent: number;
  formatMoney: (value: number) => string;
}) {
  if (!complexity) return null;

  const tierMeta: Record<
    CalculationResult["complexity"]["tier"],
    { label: string; description: string }
  > = {
    starter: {
      label: "Starter",
      description: "Lean build with limited CMS + integrations. 20% buffer recommended.",
    },
    professional: {
      label: "Professional",
      description: "Standard marketing stack with select integrations. 25% buffer recommended.",
    },
    growth: {
      label: "Growth",
      description: "Large CMS footprint or heavier automation. 30% buffer recommended.",
    },
    enterprise: {
      label: "Enterprise",
      description: "Mission-critical, multi-system build. 40% buffer minimum.",
    },
  };

  const tier = tierMeta[complexity.tier];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start gap-3">
        <Layers3 className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <p className="text-xs text-primary/70">Complexity tier</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-white">{tier.label}</p>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted-foreground">
              {complexity.total} pts
            </span>
            <span className="text-xs text-muted-foreground">{tier.description}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-white">
        <p className="text-xs uppercase tracking-wide text-primary/80">Contingency buffer</p>
        <p className="mt-1 text-lg font-semibold">
          {formatMoney(bufferCost)} · {bufferPercent}%{" "}
          <span className="text-xs font-normal text-white/70">
            ({hoursFormatter.format(bufferHours)} hrs earmarked for revisions + QA)
          </span>
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {complexity.categories.map((category) => (
          <div
            key={category.id}
            className="rounded-xl border border-white/10 bg-white/[0.01] p-3 text-xs text-muted-foreground"
          >
            <div className="flex items-center justify-between text-white">
              <p className="text-sm font-semibold">{category.label}</p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                {category.score}/{category.max}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">{category.rationale}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentMilestonesCard({
  totalCost,
  formatCurrency,
}: {
  totalCost: number;
  formatCurrency: (value: number) => string;
}) {
  const plan = selectPaymentPlan(totalCost);
  return (
    <Card className="border-white/10 bg-white/[0.02]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Payment milestones</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">{plan.narrative}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3">
          {plan.milestones.map((milestone) => {
            const amount = totalCost * milestone.percent;
            return (
              <li
                key={milestone.id}
                className="rounded-xl border border-white/10 bg-white/[0.01] px-3 py-2 text-sm text-white"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{milestone.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(amount)} · {Math.round(milestone.percent * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{milestone.note}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function RetainerCard({
  packages,
  formatCurrency,
}: {
  packages: CalculationResult["retainers"];
  formatCurrency: (value: number) => string;
}) {
  if (!packages.length) return null;
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="gap-2 border-b border-white/5 pb-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Maintenance & retainer outlook</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Benchmarked against the $1k-$5k/month care tiers from the 2025 retainer guide.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs text-primary/70">{pkg.label}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(pkg.monthlyFee)}/mo</p>
              <p className="text-xs text-muted-foreground">
                {hoursFormatter.format(pkg.hours)} hrs/mo budget
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {pkg.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MaintenanceGuidance({
  maintenanceHours,
  maintenanceCost,
  totalHours,
  maintenanceScope,
  maintenancePercent,
  maintenanceWarning,
  formatMoney,
}: {
  maintenanceHours: number;
  maintenanceCost: number;
  totalHours: number;
  maintenanceScope: MaintenanceScope;
  maintenancePercent: number;
  maintenanceWarning: boolean;
  formatMoney: (value: number) => string;
}) {
  const maintenanceShare = Math.round(maintenancePercent * 100);
  const scopeNarrative: Record<MaintenanceScope, string> = {
    core: "Covers uptime monitoring, security patches, and critical fixes.",
    content_ops: "Adds monthly content and SEO refresh cycles on top of core monitoring.",
    feature_sprints: "Sized to include roadmap collaboration beyond pure upkeep.",
  };
  const featureNarrative: Record<MaintenanceScope, string> = {
    core: "Use scoped mini-projects for net-new sections, experiments, or campaigns.",
    content_ops: "Major feature drops should still be quoted separately; this retainer is for steady optimization.",
    feature_sprints:
      "Call out roadmap work separately so the client understands which hours belong to iterative development.",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-4 transition-colors",
        maintenanceWarning ? "border-amber-300/70 bg-amber-400/5" : "border-white/10 bg-white/[0.02]",
      )}
    >
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Gauge className="h-4 w-4 text-primary" />
        Maintenance guidance
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-[11px] text-primary/70">Core maintenance</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {hoursFormatter.format(maintenanceHours)} hrs/mo (~{formatMoney(maintenanceCost)}) · roughly{" "}
            {maintenanceShare}% of total effort. {scopeNarrative[maintenanceScope]}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-primary/70">Feature iteration</p>
          <p className="mt-1 text-sm text-muted-foreground">{featureNarrative[maintenanceScope]}</p>
          {maintenanceWarning && (
            <p className="mt-2 text-xs text-amber-200">
              Exceeding 25 hrs/mo or 20% of build hours usually signals roadmap work—spin that portion into a
              sprint or mini-project for clarity.
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Total hours: {hoursFormatter.format(totalHours)} · Maintenance focus:{" "}
        {maintenanceScope.replace(/_/g, " ")}
      </p>
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
      <p className="text-xs text-muted-foreground">{label}</p>
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
                <p className="text-sm font-semibold text-white">
                  {item.label}
                  {item.kind && item.kind !== "phase" && (
                    <span className="ml-2 rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {item.kind === "timeline" ? "Timeline" : "Add-on"}
                    </span>
                  )}
                </p>
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

function AddonGrid({
  addons,
  formatCurrency,
}: {
  addons: CalculationResult["addons"];
  formatCurrency: (value: number) => string;
}) {
  if (!addons.length) return null;
  const grouped = addons.reduce<Record<string, typeof addons>>((acc, addon) => {
    const key = addon.category ?? "other";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(addon);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    integration: "Integrations",
    seo: "SEO enablement",
    training: "Training & enablement",
    localization: "Localization",
    timeline: "Timeline pressure",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-primary/70">{categoryLabels[category] ?? "Additional scope"}</p>
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-white/[0.01] p-3 text-sm text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(item.cost)} · {hoursFormatter.format(item.hours)} hrs
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TierView({
  tiers,
  formatCurrency,
}: {
  tiers: Array<{
    id: string;
    label: string;
    description: string;
    cost: number;
    hours: number;
    features: string[];
    priceHint: string;
  }>;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tiers.map((tier) => (
        <div key={tier.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-primary/70">{tier.priceHint}</p>
          <p className="text-lg font-semibold text-white">{tier.label}</p>
          <p className="text-2xl font-semibold text-white">{formatCurrency(tier.cost)}</p>
          <p className="text-xs text-muted-foreground">
            {hoursFormatter.format(tier.hours)} hrs (incl. maintenance)
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {tier.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 h-4 w-4 text-primary" />
      <div>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
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
  className,
}: {
  result: CalculationResult;
  source: string;
  className?: string;
}) {
  const highlights =
    result.ai?.highlights ??
    [
      "Custom design system with immersive interactions",
      "HubSpot + marketing automation integration",
      "Content refresh for 12 layouts + blog templates",
    ];

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
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
        <div className="space-y-2 text-sm text-white">
          {highlights.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/10 p-3">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
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

function ShareNote({ className }: { className?: string }) {
  return (
    <Card className={cn("border-white/10 bg-white/[0.02]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Share-ready</CardTitle>
        <p className="text-xs text-muted-foreground">
          Copy the public link or export a PDF whenever you are ready to share with stakeholders.
        </p>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-4">
          <p className="text-xs text-muted-foreground">Next steps</p>
          <ul className="mt-2 space-y-1">
            <li>• Copy link for async reviews</li>
            <li>• Export PDF (watermark removed on Pro)</li>
            <li>• Embed results in proposals</li>
          </ul>
        </div>
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
  const blueprints = [
    {
      id: "essential",
      label: "Essential",
      description: "Template-driven builds, baseline CMS, and a single integration.",
      priceHint: "Essential · $3k-$6k benchmark",
      factor: 0.6,
      features: ["5-7 core pages", "Baseline SEO + redirects", "1 revision round"],
    },
    {
      id: "professional",
      label: "Professional (sweet spot)",
      description: "Custom design system, CMS depth, and 2-3 integrations.",
      priceHint: "Professional · $8k-$15k benchmark",
      factor: 1,
      features: ["10-15 pages + blog", "Advanced interactions", "HubSpot/analytics wiring"],
    },
    {
      id: "premium",
      label: "Premium",
      description: "Enterprise polish, localization, and retained QA support.",
      priceHint: "Premium · $20k+ benchmark",
      factor: 1.4,
      features: ["20+ pages & localization", "Complex CMS + automations", "90-day hypercare"],
    },
  ] as const;

  return blueprints.map((tier) => ({
    ...tier,
    cost: result.totalCost * tier.factor,
    hours: result.totalHours * tier.factor,
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
  const bufferCost = round(base.bufferCost * factor);
  const effectiveHourlyRate = round(
    (totalCost / base.totalHours) || base.effectiveHourlyRate,
    2,
  );
  return {
    ...base,
    totalCost,
    maintenanceCost,
    bufferCost,
    effectiveHourlyRate,
    addons: base.addons.map((addon) => ({
      ...addon,
      cost: round(addon.cost * factor),
    })),
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


