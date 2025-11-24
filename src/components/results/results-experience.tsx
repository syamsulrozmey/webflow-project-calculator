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
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/calculator/from-answers";
import type { CalculationResult, LineItem, MaintenanceScope } from "@/lib/calculator/types";
import { loadCalculationResult, type CalculationMeta } from "@/lib/calculator/storage";
import type { AgencyRateSummary } from "@/lib/agency/types";
import { selectPaymentPlan } from "@/lib/calculator/payment-plan";
import { generateBasicPdfReport } from "@/lib/export/basic-pdf";
import { cn } from "@/lib/utils";
import { formatFxRelativeTime, useCurrencyRates } from "@/hooks/use-currency-rates";
import { convertCalculationResult } from "@/lib/currency/convert";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileDown,
  Gauge,
  Layers3,
  Loader2,
  PieChart,
  PlugZap,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

const hoursFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const currencyOptions = SUPPORTED_CURRENCIES.map((code) => ({
  label: code.toUpperCase(),
  value: code,
}));

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
  const [displayCurrency, setDisplayCurrency] = useState<SupportedCurrency>(meta.currency);
  const [hasManualCurrencySelection, setHasManualCurrencySelection] = useState(false);
  const heroCardRef = useRef<HTMLDivElement | null>(null);
  const [isShareBarVisible, setIsShareBarVisible] = useState(false);
  const [viewModeToast, setViewModeToast] = useState<string | null>(null);
  const [timelineToast, setTimelineToast] = useState<string | null>(null);
  const exportStatusTimeout = useRef<number | null>(null);
  const {
    rates: currencyRates,
    loading: isCurrencyRatesLoading,
    error: currencyError,
    convert: convertCurrencyValue,
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

  useEffect(() => {
    setHasManualCurrencySelection(false);
  }, [baseResult]);

  useEffect(() => {
    if (hasManualCurrencySelection) return;
    setDisplayCurrency(meta.currency);
  }, [meta.currency, hasManualCurrencySelection]);

  useEffect(() => {
    if (!heroCardRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsShareBarVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(heroCardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const label = viewMode === "detailed" ? "Detailed line items applied" : "Tiered rollup applied";
    setViewModeToast(label);
    const timer = window.setTimeout(() => setViewModeToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const label = timelineView === "gantt" ? "Gantt timeline active" : "Phase checklist active";
    setTimelineToast(label);
    const timer = window.setTimeout(() => setTimelineToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [timelineView]);

  const adjustedResult = useMemo(
    () => applyMargin(baseResult, meta.margin, margin),
    [baseResult, meta.margin, margin],
  );
  const displayResult = useMemo(
    () =>
      displayCurrency === meta.currency
        ? adjustedResult
        : convertCalculationResult(adjustedResult, meta.currency, displayCurrency, currencyRates),
    [adjustedResult, currencyRates, displayCurrency, meta.currency],
  );
  const displayMeta = useMemo(() => {
    const convertOptional = (value?: number) =>
      typeof value === "number"
        ? convertCurrencyValue(value, meta.currency, displayCurrency)
        : undefined;
    return {
      ...meta,
      currency: displayCurrency,
      hourlyRate: convertCurrencyValue(meta.hourlyRate, meta.currency, displayCurrency),
      internalHourlyRate: convertOptional(meta.internalHourlyRate),
      agencyRateSummary: meta.agencyRateSummary
        ? {
            ...meta.agencyRateSummary,
            blendedCostRate: convertCurrencyValue(
              meta.agencyRateSummary.blendedCostRate,
              meta.currency,
              displayCurrency,
            ),
            recommendedBillableRate: convertCurrencyValue(
              meta.agencyRateSummary.recommendedBillableRate,
              meta.currency,
              displayCurrency,
            ),
            teamSnapshot: meta.agencyRateSummary.teamSnapshot.map((member) => ({
              ...member,
              costRate: convertCurrencyValue(member.costRate, meta.currency, displayCurrency),
              billableRate:
                typeof member.billableRate === "number"
                  ? convertCurrencyValue(member.billableRate, meta.currency, displayCurrency)
                  : member.billableRate,
            })),
          }
        : undefined,
    };
  }, [convertCurrencyValue, displayCurrency, meta]);
  const tierRows = useMemo(() => buildTierRows(displayResult), [displayResult]);
  const roughWeeks = displayResult.productionHours / 35;
  const minWeeks = Math.max(4, Math.round(roughWeeks));
  const timelineCopy = `${minWeeks}-${minWeeks + 2} weeks`;
  const maintenancePercent =
    displayResult.totalHours > 0
      ? displayResult.maintenanceHours / displayResult.totalHours
      : 0;
  const bufferPercentLabel = Math.round(displayResult.bufferPercentage * 100);
  const maintenanceScope = displayResult.maintenanceScope ?? "core";
  const maintenanceWarning =
    displayResult.maintenanceHours > 25 || maintenancePercent > 0.2;
  const hourlyBenchmarkCopy = useMemo(() => {
    const rate = displayMeta.hourlyRate;
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
  }, [displayMeta.hourlyRate]);
  const formatMoney = useCallback(
    (value: number) => formatCurrencyValue(value, displayCurrency),
    [displayCurrency],
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
  const marginDeltaCopy =
    Math.abs(margin - meta.margin) < 0.005
      ? "Baseline margin"
      : margin > meta.margin
        ? `+${Math.round((margin - meta.margin) * 100)} pts over baseline`
        : `${Math.round((margin - meta.margin) * 100)} pts under baseline`;
  const summaryGroups = useMemo(
    () => [
      {
        id: "delivery",
        title: "Delivery assumptions",
        caption: "Pace & sprinting",
        stats: [
          {
            label: "Timeline",
            value: timelineCopy,
            helper: "Production hours translated to weeks + 2 sprint buffer.",
            tooltip: "We divide production hours by a 35 hr sprint and add two sprints of QA and launch buffer.",
          },
          {
            label: "Hourly rate",
            value: `${formatMoney(displayMeta.hourlyRate)} / hr`,
            helper:
              typeof displayMeta.internalHourlyRate === "number"
                ? `${hourlyBenchmarkCopy} · Internal cost ${formatMoney(displayMeta.internalHourlyRate)}`
                : hourlyBenchmarkCopy,
            tooltip: "Client-facing blended rate derived from your base inputs (auto-converted when FX changes).",
          },
        ],
      },
      {
        id: "financial",
        title: "Financial levers",
        caption: "Ongoing cost drivers",
        stats: [
          {
            label: "Maintenance",
            value: formatMoney(displayResult.maintenanceCost),
            helper: maintenanceWarning
              ? `${hoursFormatter.format(displayResult.maintenanceHours)} hrs/mo · scope as mini-project`
              : `${hoursFormatter.format(displayResult.maintenanceHours)} hours / mo`,
            tooltip: "Monthly upkeep derived from retainer inputs. We flag it when the ratio exceeds 20% of build hours.",
          },
          {
            label: "Margin",
            value: `${Math.round(margin * 100)}%`,
            helper: marginDeltaCopy,
            tooltip: "Slides between 5%-60% so you can test markup scenarios without re-running the engine.",
          },
        ],
      },
      {
        id: "risk",
        title: "Risk buffer",
        caption: "QA + revisions",
        stats: [
          {
            label: "Contingency",
            value: `${formatMoney(displayResult.bufferCost)} · ${bufferPercentLabel}%`,
            helper: `${hoursFormatter.format(displayResult.bufferHours)} hrs reserved for revisions + QA`,
            tooltip: "Buffer percentage pulled from the complexity tier. Adjust tier or margin to change this reserve.",
          },
        ],
      },
    ],
    [
      bufferPercentLabel,
      displayMeta.hourlyRate,
      displayMeta.internalHourlyRate,
      displayResult.bufferCost,
      displayResult.bufferHours,
      displayResult.maintenanceCost,
      displayResult.maintenanceHours,
      formatMoney,
      hourlyBenchmarkCopy,
      maintenanceWarning,
      margin,
      marginDeltaCopy,
      timelineCopy,
    ],
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

  const handleCurrencyChange = useCallback(
    (nextCurrency: SupportedCurrency) => {
      setDisplayCurrency(nextCurrency);
      setHasManualCurrencySelection(true);
    },
    [],
  );

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
        result: displayResult,
        meta: { ...displayMeta, margin },
        source: resultSource,
      });
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildExportFileName(displayResult);
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
  }, [displayResult, displayMeta, margin, resultSource, isExporting, scheduleExportStatusReset]);

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

  useEffect(() => {
    if (!displayResult.lineItems.length) return;
    setExpanded((prev) => {
      if (Object.keys(prev).length > 0) {
        return prev;
      }
      return { [displayResult.lineItems[0].id]: true };
    });
  }, [displayResult.lineItems]);

  return (
    <div className="space-y-8">
      <Card ref={heroCardRef} className="border-white/10 bg-white/[0.04]">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs text-primary/80">
                  Estimate summary
                </p>
                <h2 className="text-3xl font-semibold md:text-4xl">
                  {formatMoney(displayResult.totalCost)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {hoursFormatter.format(displayResult.totalHours)} hours · Tier{" "}
                  {displayResult.tier.toString().replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pricing currency: {displayCurrency.toUpperCase()}
                  {displayCurrency !== meta.currency ? (
                    <> · Base quote {meta.currency.toUpperCase()}</>
                  ) : null}
                  {currencyMetaLabel ? <> · {currencyMetaLabel}</> : null}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 md:hidden">
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
                </div>
                <div className="flex flex-wrap items-center gap-2">
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

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <SegmentedControl
                    label="Currency"
                    value={displayCurrency}
                    options={currencyOptions}
                    onChange={(value) => handleCurrencyChange(value as SupportedCurrency)}
                  />
                  {currencyMetaLabel ? (
                    <span className="text-[11px] text-muted-foreground">{currencyMetaLabel}</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Live FX — synced moments ago</span>
                  )}
                  {hasManualCurrencySelection && (
                    <span className="rounded-full border border-white/15 px-2 py-0.5 text-[11px] text-primary">
                      Converted from {meta.currency.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Switching currency keeps the underlying quote intact and refreshes every line item instantly.
                </p>
              </div>
              <div className="mt-4">
                <MarginControl
                  margin={margin}
                  baseline={meta.margin}
                  currencyFormatter={formatMoney}
                  totalCost={displayResult.totalCost}
                  onChange={setMargin}
                  variant="inline"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {summaryGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-3xl border border-white/5 bg-white/[0.015] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] uppercase tracking-wide text-primary/70">{group.title}</p>
                    {group.caption ? (
                      <p className="text-[11px] text-muted-foreground">{group.caption}</p>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {group.stats.map((stat) => (
                      <SummaryStat key={stat.label} {...stat} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        <ComplexityCard
          complexity={displayResult.complexity}
          bufferHours={displayResult.bufferHours}
          bufferCost={displayResult.bufferCost}
          bufferPercent={bufferPercentLabel}
          formatMoney={formatMoney}
        />
        <MaintenanceGuidance
          maintenanceHours={displayResult.maintenanceHours}
          maintenanceCost={displayResult.maintenanceCost}
          totalHours={displayResult.totalHours}
          maintenanceScope={maintenanceScope}
          maintenancePercent={maintenancePercent}
          maintenanceWarning={maintenanceWarning}
          formatMoney={formatMoney}
        />
        <PaymentMilestonesCard totalCost={displayResult.totalCost} formatCurrency={formatMoney} />

          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(displayResult.factors).map(([key, factor]) => (
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

      {displayResult.retainers.length > 0 && (
        <RetainerCard
          packages={displayResult.retainers}
          formatCurrency={formatMoney}
          recommendedHours={displayResult.maintenanceHours}
          maintenanceScope={maintenanceScope}
        />
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
          <div className="hidden flex-wrap items-center gap-3 pt-2 md:flex">
            <SegmentedControl
              label="View mode"
              value={viewMode}
              options={[
                { label: "Detailed", value: "detailed" },
                { label: "Tiered", value: "tiers" },
              ]}
              onChange={(value) => setViewMode(value as ViewMode)}
            />
            {viewModeToast ? (
              <span className="rounded-full border border-primary/30 px-3 py-0.5 text-[11px] text-primary">
                {viewModeToast}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <PhaseShareChart lineItems={displayResult.lineItems} totalHours={displayResult.productionHours} />
          <section className="space-y-4">
            {viewMode === "detailed" ? (
              <DetailedBreakdown
                lineItems={displayResult.lineItems}
                expanded={expanded}
                onToggle={handleToggle}
                formatCurrency={formatMoney}
              />
            ) : (
              <TierView tiers={tierRows} formatCurrency={formatMoney} />
            )}
          </section>

          {displayResult.addons.length > 0 && (
            <section className="space-y-4 border-t border-white/5 pt-6">
              <SectionHeader
                icon={PlugZap}
                title="Add-ons & modules"
                description="Transparent hours for integrations, localization, training, and rush coordination pulled from your answers."
              />
              <AddonGrid addons={displayResult.addons} formatCurrency={formatMoney} />
            </section>
          )}

          <section className="space-y-4 border-t border-white/5 pt-6">
            <SectionHeader
              icon={Clock3}
              title="Timeline"
              description="Sequenced estimate including QA & launch buffer."
            />
            <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
              <SegmentedControl
                label="Timeline"
                value={timelineView}
                options={[
                  { label: "Gantt", value: "gantt" },
                  { label: "Phases", value: "phases" },
                ]}
                onChange={(value) => setTimelineView(value as TimelineView)}
              />
              {timelineToast ? (
                <span className="rounded-full border border-primary/30 px-3 py-0.5 text-[11px] text-primary">
                  {timelineToast}
                </span>
              ) : null}
            </div>
            <TimelineCard
              lineItems={displayResult.lineItems}
              totalHours={displayResult.productionHours}
              view={timelineView}
              formatCurrency={formatMoney}
            />
          </section>

          {displayMeta.agencyRateSummary && (
            <section className="space-y-4 border-t border-white/5 pt-6">
              <SectionHeader
                icon={Users}
                title="Agency economics"
                description="Internal blended rate vs client-facing quote and roster snapshot."
              />
              <AgencyEconomicsCard
                summary={displayMeta.agencyRateSummary}
                formatCurrency={formatMoney}
                currencySymbol={displayCurrency === "eur" ? "€" : displayCurrency === "gbp" ? "£" : "$"}
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
              result={displayResult}
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
      <StickyShareBar
        visible={isShareBarVisible}
        copyStatus={copyStatus}
        onCopy={handleCopyLink}
        onExport={handleExportPdf}
        exportLabel={exportButtonLabel}
        isExporting={isExporting}
      />
    </div>
  );
}

function StickyShareBar({
  visible,
  copyStatus,
  onCopy,
  onExport,
  exportLabel,
  isExporting,
}: {
  visible: boolean;
  copyStatus: "idle" | "copied" | "error";
  onCopy: () => void;
  onExport: () => void;
  exportLabel: string;
  isExporting: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs text-white shadow-lg shadow-black/40 backdrop-blur">
        <span className="text-[11px] uppercase tracking-wide text-white/70">Share this estimate</span>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-white hover:text-primary"
          onClick={onCopy}
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
          size="sm"
          className="gap-1 bg-primary px-3 text-primary-foreground"
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {exportLabel}
        </Button>
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
          <p className="text-xs text-muted-foreground">Team roster</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {visibleMembers.map((member) => {
              const quotedRate =
                typeof member.billableRate === "number" ? member.billableRate : member.costRate * 2;
              return (
                <li key={member.id} className="flex items-center justify-between gap-3">
                  <span className="text-white">{member.name || member.role}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(member.costRate)} → {formatCurrency(quotedRate)}
                  </span>
                </li>
              );
            })}
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
          <p className="flex items-center gap-1 text-xs text-primary/70">
            Complexity tier
            <InfoTooltip text="Point system pulled from questionnaire answers + AI adjustments." />
          </p>
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
        <p className="flex items-center gap-1 text-xs uppercase tracking-wide text-primary/80">
          Contingency buffer
          <InfoTooltip text="Hours reserved for revisions + QA. Adjust tier or override margin to change the buffer." />
        </p>
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
  recommendedHours,
  maintenanceScope,
}: {
  packages: CalculationResult["retainers"];
  formatCurrency: (value: number) => string;
  recommendedHours: number;
  maintenanceScope: MaintenanceScope;
}) {
  if (!packages.length) return null;
  const scopeHints: Record<MaintenanceScope, string> = {
    core: "baseline uptime + critical fixes",
    content_ops: "content ops cadence with light SEO",
    feature_sprints: "roadmap sprints + experiments",
  };
  const recommendedPkg = packages.reduce((closest, pkg) => {
    const currentDelta = Math.abs(pkg.hours - recommendedHours);
    const closestDelta = Math.abs(closest.hours - recommendedHours);
    return currentDelta < closestDelta ? pkg : closest;
  }, packages[0]);

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="gap-2 border-b border-white/5 pb-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Maintenance & retainer outlook</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          After launch, here’s what ongoing care looks like based on your {maintenanceScope.replace(/_/g, " ")} scope.
        </p>
        <p className="text-xs text-muted-foreground">
          Benchmarked against the $1k-$5k/month care tiers from the 2025 retainer guide. Use the badge to anchor your default recommendation.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-primary/70">{pkg.label}</p>
                {pkg.id === recommendedPkg.id && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                    Recommended
                  </span>
                )}
              </div>
              <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(pkg.monthlyFee)}/mo</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {hoursFormatter.format(pkg.hours)} hrs/mo budget
                <InfoTooltip text={`Sized for ${scopeHints[maintenanceScope]}. Adjust cadence to change.`} />
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
  tooltip,
}: {
  label: string;
  value: string;
  helper?: string;
  tooltip?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{label}</span>
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function InfoTooltip({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn("ml-1 inline-flex items-center text-muted-foreground/80", className)}
      title={text}
      aria-label={text}
    >
      <CircleHelp className="h-3.5 w-3.5" />
    </span>
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

function PhaseShareChart({
  lineItems,
  totalHours,
}: {
  lineItems: LineItem[];
  totalHours: number;
}) {
  if (!lineItems.length || totalHours <= 0) return null;
  const palette = ["bg-primary", "bg-emerald-400", "bg-sky-500", "bg-amber-400", "bg-pink-400", "bg-white/40"];
  const sorted = [...lineItems].sort((a, b) => b.hours - a.hours);
  const top = sorted.slice(0, 5);
  const used = top.reduce((sum, item) => sum + item.hours, 0);
  const remainder = Math.max(totalHours - used, 0);
  if (remainder > 1) {
    top.push({
      id: "other",
      label: "Other tasks",
      hours: remainder,
      cost: 0,
      description: "Remainder of minor tasks.",
    });
  }
  const segments = top.map((item, index) => ({
    id: item.id,
    label: item.label,
    percent: Math.max((item.hours / totalHours) * 100, 1),
    color: palette[index % palette.length],
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-white">Phase share preview</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Snapshot of where production hours concentrate. Expand below for detailed rationale.
      </p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/5">
        <div className="flex h-full w-full">
          {segments.map((segment) => (
            <span
              key={segment.id}
              className={cn("block h-full", segment.color)}
              style={{ width: `${segment.percent}%` }}
            />
          ))}
        </div>
      </div>
      <ul className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        {segments.map((segment) => (
          <li key={segment.id} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", segment.color)} />
              <span className="text-white">{segment.label}</span>
            </span>
            <span>{segment.percent.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
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
        const bullets = item.description
          .split(/(?:\n|•|-)/)
          .map((entry) => entry.replace(/^[\s•-]+/, "").trim())
          .filter(Boolean);
        const preview = bullets[0] ?? item.description;
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
                  {" "}
                  <InfoTooltip text={item.description} />
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
            <p className="mt-1 text-[11px] text-muted-foreground/80 line-clamp-2">{preview}</p>
            {isOpen && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-muted-foreground">
                {bullets.length > 1 ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {bullets.slice(0, 3).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{item.description}</p>
                )}
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
  variant = "inline",
}: {
  margin: number;
  baseline: number;
  currencyFormatter: (value: number) => string;
  totalCost: number;
  onChange: (value: number) => void;
  variant?: "inline" | "card";
}) {
  const percentage = Math.round(margin * 100);
  const diff = margin - baseline;
  const diffLabel =
    Math.abs(diff) < 0.005
      ? "Baseline margin"
      : diff > 0
        ? `+${Math.round(diff * 100)} pts over baseline`
        : `${Math.round(diff * 100)} pts under baseline`;
  const fivePointShift = currencyFormatter(totalCost * 0.05);

  const body = (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-primary/80">
          Margin override
          <InfoTooltip text="Slides between 5%-60%. Use to pressure-test markup or concessions." />
        </div>
        <span className="rounded-full border border-white/15 px-3 py-0.5 text-xs text-white">
          {percentage}%
        </span>
      </div>
      <input
        type="range"
        min={0.05}
        max={0.6}
        step={0.01}
        value={margin}
        aria-label="Adjust profit margin"
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
      <p className="text-xs text-muted-foreground">
        New total: {currencyFormatter(totalCost)} (updates summary + line items)
      </p>
      <p className="text-[11px] text-muted-foreground">
        {diffLabel}. Every 5 pts shifts the quote by roughly {fivePointShift}. Use it to negotiate scope vs. profit.
      </p>
    </div>
  );

  if (variant === "card") {
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
        <CardContent className="pt-0">{body}</CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-4">
      {body}
    </div>
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


