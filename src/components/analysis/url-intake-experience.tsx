"use client";

import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildFlowHref } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { saveLatestAnalysis } from "@/lib/analysis/storage";
import type { AnalysisResult } from "@/types/analysis";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock4,
  ExternalLink,
  FileChartColumn,
  Globe,
  History,
  Info,
  Loader2,
  PlugZap,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const HISTORY_KEY = "wpc-url-analysis-history";

const crawlPhases = [
  {
    key: "queued",
    label: "Queued",
    description: "Reserving Firecrawl worker",
  },
  {
    key: "crawling",
    label: "Crawling",
    description: "Mapping sitemap, assets, and forms",
  },
  {
    key: "summarizing",
    label: "Summarizing",
    description: "Scoring complexity & stack",
  },
] as const;

interface UrlIntakeExperienceProps {
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
}

type AnalysisStatus =
  | "idle"
  | "queued"
  | "crawling"
  | "summarizing"
  | "completed"
  | "error";

export function UrlIntakeExperience({
  entry,
  userType,
}: UrlIntakeExperienceProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      return stored ? (JSON.parse(stored) as AnalysisResult[]) : [];
    } catch {
      return [];
    }
  });
  const [notice, setNotice] = useState<string | null>(null);
  const effectiveEntry: EntryFlow = entry ?? "existing";
  const effectiveUserType = userType ?? null;

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const ctaHref = buildFlowHref("/questionnaire", "existing", effectiveUserType);

  const phaseProgress = useMemo(() => {
    return crawlPhases.map((phase, index) => ({
      ...phase,
      state:
        status === "completed"
          ? "done"
          : index < phaseIndex
            ? "done"
            : index === phaseIndex
              ? "active"
              : "upcoming",
    }));
  }, [phaseIndex, status]);

  const exampleUrls = useMemo(
    () => [
      "atelier-northern.com",
      "commerce-stack.io",
      "legacywordpress.org",
    ],
    [],
  );

  const isAnalyzing =
    status === "queued" || status === "crawling" || status === "summarizing";

  const handleExampleClick = (value: string) => {
    setInputValue(value);
    setError(null);
  };

  const clearPhaseTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const startPhaseTimers = () => {
    if (typeof window === "undefined") return;
    clearPhaseTimers();
    crawlPhases.forEach((phase, index) => {
      const timeoutId = window.setTimeout(() => {
        setPhaseIndex(index);
        setStatus(phase.key as AnalysisStatus);
      }, index * 1400);
      timersRef.current.push(timeoutId);
    });
  };

  const persistHistory = (analysis: AnalysisResult) => {
    setHistory((prev) => {
      const next = [analysis, ...prev.filter((item) => item.url !== analysis.url)];
      const limited = next.slice(0, 4);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
      }
      return limited;
    });
  };

  const handleSubmit = async () => {
    const normalized = normalizeUrl(inputValue);
    if (!normalized.ok) {
      setError(normalized.error);
      return;
    }

    setError(null);
    setStatus("queued");
    setPhaseIndex(0);
    setResult(null);
    setNotice(null);
    startPhaseTimers();

    try {
      const analysis = await requestAnalysis(normalized.value);
      persistHistory(analysis);
      saveLatestAnalysis(analysis);
      clearPhaseTimers();
      setResult(analysis);
      setStatus("completed");
      setPhaseIndex(crawlPhases.length);
      if (analysis.source === "simulated") {
        setNotice(
          "Showing simulated crawl data until Firecrawl integration is live.",
        );
      }
    } catch (err) {
      clearPhaseTimers();
      const message =
        err instanceof Error ? err.message : "Unable to analyze this URL.";
      setError(message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    clearPhaseTimers();
    setInputValue("");
    setError(null);
    setStatus("idle");
    setPhaseIndex(0);
    setResult(null);
    setNotice(null);
  };

  const handleHistorySelect = (record: AnalysisResult) => {
    setResult(record);
    setStatus("completed");
    setPhaseIndex(crawlPhases.length);
    saveLatestAnalysis(record);
    setNotice(
      record.source === "simulated"
        ? "Showing saved simulated crawl data."
        : null,
    );
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-gradient-to-r from-[#0b0f1f] to-[#090b16]">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
                Existing site analysis
              </p>
              <CardTitle className="text-3xl">
                Capture the current footprint before migrating.
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                We’ll crawl the URL, detect stack + complexity, and feed it into
                the streamlined questionnaire.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
              <p>
                Context:{" "}
                <span className="text-white">
                  {effectiveEntry === "existing" ? "Existing site flow" : "Flow TBD"}
                </span>
              </p>
              <p>
                User type:{" "}
                <span className="text-white">
                  {effectiveUserType
                    ? effectiveUserType.charAt(0).toUpperCase() +
                      effectiveUserType.slice(1)
                    : "Not set"}
                </span>
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white">
                Website URL
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(event) => {
                      setInputValue(event.target.value);
                      setError(null);
                    }}
                    placeholder="https://clientsite.com"
                    className={cn(
                      "w-full rounded-xl border bg-transparent px-4 py-3 text-base text-white outline-none transition",
                      error
                        ? "border-destructive focus-visible:ring-destructive/40"
                        : "border-white/15 focus-visible:ring-primary/40",
                      isAnalyzing && "opacity-70",
                    )}
                    disabled={isAnalyzing}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-destructive">{error}</p>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isAnalyzing || !inputValue.trim()}
                  className="w-full gap-2 sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      Analyze website
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {exampleUrls.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-full border border-white/15 px-3 py-1 transition hover:border-white/40 hover:text-white"
                    onClick={() => handleExampleClick(example)}
                    disabled={isAnalyzing}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 text-white">
                <Info className="h-4 w-4 text-primary" />
                What we extract
              </p>
              <ul className="mt-3 space-y-2">
                <li>Page count, sitemap structure, asset inventory</li>
                <li>Detected CMS/platform + integrations</li>
                <li>Complexity score feeding the calc engine</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-3 border-t border-white/10 px-6 py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <PlugZap className="h-3.5 w-3.5 text-primary" />
            Firecrawl-ready placeholder
          </div>
          <div className="flex items-center gap-2">
            <Clock4 className="h-3.5 w-3.5 text-primary" />
            Autosaves last 4 analyses
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Deterministic summary for questionnaire
          </div>
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="border-b border-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
              Crawl progress
            </p>
            <CardTitle className="text-2xl">Status timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Timeline phases={phaseProgress} />
            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary-foreground">
                <Info className="mt-0.5 h-4 w-4 text-primary" />
                {notice}
              </div>
            )}
            {status === "completed" && result && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.01] p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                      Ready for questionnaire
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {result.normalizedUrl}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.metrics.pages} pages · {result.stack.platform} ·{" "}
                      {result.stack.technologies.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="gap-2">
                      <Link href={ctaHref}>
                        Continue to questionnaire
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/20"
                      onClick={handleReset}
                    >
                      Run another URL
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {status === "error" && error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <InsightCard kicker="Summary" title="Latest crawl output" icon={FileChartColumn}>
            {result ? (
              <SummaryMetrics result={result} />
            ) : (
              <PlaceholderText>
                Run a crawl to unlock metrics, stack detection, and recommended focus areas.
              </PlaceholderText>
            )}
          </InsightCard>

          <InsightCard kicker="History" title="Recent analyses" icon={History}>
            {history.length === 0 ? (
              <PlaceholderText>
                Once you process a URL it will be available here for quick reference.
              </PlaceholderText>
            ) : (
              <div className="space-y-3 text-sm">
                {history.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="w-full rounded-xl border border-white/10 px-4 py-3 text-left transition hover:border-white/30"
                    onClick={() => handleHistorySelect(record)}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <span>{new URL(record.normalizedUrl).hostname}</span>
                      <span>{record.metrics.pages} pages</span>
                    </div>
                    <p className="text-sm text-white">
                      {record.stack.platform} · {record.stack.technologies[0]}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </InsightCard>

          <InsightCard kicker="Next step" title="What happens after?" icon={BarChart3}>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Streamlined questionnaire focuses on deltas & improvements.</li>
              <li>Deterministic engine merges crawl metrics + answers.</li>
              <li>Exports highlight migration scope vs net-new work.</li>
            </ul>
          </InsightCard>
        </aside>
      </div>

      {result && (
        <Card className="border-white/5 bg-white/[0.01]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                  Crawl summary
                </p>
                <CardTitle className="text-2xl">Site insights</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  label: "Pages discovered",
                  value: result.metrics.pages,
                },
                {
                  label: "Avg words / page",
                  value: result.metrics.avgWordsPerPage,
                },
                {
                  label: "Assets",
                  value: `${result.metrics.images} images / ${result.metrics.videos} videos`,
                },
                {
                  label: "Forms tracked",
                  value: result.metrics.forms,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="text-xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                  Technology stack
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.stack.platform} on {result.stack.hosting}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {result.stack.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/15 px-3 py-1"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                  Complexity score
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${result.complexityScore}%` }}
                    />
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    {result.complexityScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated {result.estimatedHours} hours to rebuild / migrate.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
                  Page mix
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.pageTypes.map((item) => (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className="flex-1">{item.label}</span>
                      <span className="rounded-full border border-white/10 px-3 py-0.5 text-xs">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
                  Recommendations
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {result.recommendations.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">Watch outs</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Timeline({
  phases,
}: {
  phases: Array<
    (typeof crawlPhases)[number] & { state: "done" | "active" | "upcoming" }
  >;
}) {
  return (
    <ol className="space-y-4">
      {phases.map((phase, index) => (
        <li
          key={phase.key}
          className={cn(
            "flex items-start gap-4 rounded-2xl border px-4 py-3 transition",
            phase.state === "done"
              ? "border-primary/60 bg-primary/10"
              : phase.state === "active"
                ? "border-primary/40 bg-white/[0.03]"
                : "border-white/10",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border">
            {phase.state === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : phase.state === "active" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <span className="text-sm text-muted-foreground">
                {index + 1}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{phase.label}</p>
            <p className="text-xs text-muted-foreground">{phase.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SummaryMetrics({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p className="text-white">{result.normalizedUrl}</p>
      <p>
        {result.metrics.pages} pages · {result.stack.platform} ·{" "}
        {result.stack.technologies.slice(0, 2).join(", ")}
      </p>
      <p>Complexity score: {result.complexityScore}/100</p>
      <p>Estimated {result.estimatedHours} migration hours</p>
      <a
        href={result.normalizedUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
      >
        Visit site
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function InsightCard({
  kicker,
  title,
  icon: Icon,
  children,
}: {
  kicker: string;
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardHeader className="pb-2">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
          {kicker}
        </p>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

function PlaceholderText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function normalizeUrl(
  value: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: "Provide a URL to analyze." };
  }
  const prefixed = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(prefixed);
    if (!parsed.hostname.includes(".")) {
      return { ok: false, error: "URL must include a valid domain." };
    }
    parsed.hash = "";
    return { ok: true, value: parsed.toString().replace(/\/$/, "") };
  } catch {
    return { ok: false, error: "Enter a valid URL (example.com)." };
  }
}

async function requestAnalysis(url: string): Promise<AnalysisResult> {
  try {
    const response = await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error("Crawler not ready yet.");
    }
    const payload = (await response.json()) as Partial<AnalysisResult>;
    return mapApiResult(url, payload);
  } catch {
    return simulateAnalysis(url);
  }
}

function mapApiResult(url: string, payload: Partial<AnalysisResult>): AnalysisResult {
  const normalized = url;
  return {
    id: crypto.randomUUID(),
    url,
    normalizedUrl: normalized,
    timestamp: new Date().toISOString(),
    metrics: {
      pages: payload.metrics?.pages ?? 18,
      avgWordsPerPage: payload.metrics?.avgWordsPerPage ?? 420,
      images: payload.metrics?.images ?? 64,
      videos: payload.metrics?.videos ?? 3,
      forms: payload.metrics?.forms ?? 5,
    },
    stack: {
      platform: payload.stack?.platform ?? "Webflow",
      hosting: payload.stack?.hosting ?? "Webflow EU",
      technologies: payload.stack?.technologies ?? ["Client-first", "GSAP"],
    },
    pageTypes:
      payload.pageTypes ?? [
        { label: "Marketing pages", count: 6 },
        { label: "Blog articles", count: 12 },
      ],
    recommendations:
      payload.recommendations ?? [
        "Tighten CMS structure before migrating.",
        "Audit legacy scripts slowing LCP.",
      ],
    warnings: payload.warnings ?? [],
    complexityScore: payload.complexityScore ?? 68,
    estimatedHours: payload.estimatedHours ?? 145,
    source: payload.source ?? "api",
  };
}

function simulateAnalysis(url: string): AnalysisResult {
  const normalized = url;
  const hash = pseudoHash(url);
  const pages = 10 + Math.floor(hash * 35);
  const images = 20 + Math.floor(hash * 80);
  const videos = Math.floor(hash * 5);
  const forms = 2 + Math.floor(hash * 4);
  const avgWords = 350 + Math.floor(hash * 200);
  const complexityScore = 45 + Math.floor(hash * 45);
  const estimatedHours = 80 + Math.floor(hash * 120);
  const platforms = ["WordPress", "Shopify", "Squarespace", "Custom", "Webflow"];
  const hostings = ["Cloudflare", "Vercel", "Netlify", "AWS", "Azure"];
  const technologies = [
    "HubSpot",
    "Google Tag Manager",
    "Segment",
    "Mailchimp",
    "Algolia",
    "Zapier",
    "Stripe",
  ];
  const warningsPool = [
    "Legacy scripts impacting performance.",
    "Multiple page builders detected—expect cleanup.",
    "Mixed content (HTTP assets) found.",
  ];
  const recommendationsPool = [
    "Map CMS collections to Webflow CMS + relational fields.",
    "Use component libraries to standardize layouts.",
    "Plan staged rollouts to avoid SEO regression.",
    "Account for responsive refactors (breakpoints inconsistent).",
  ];

  return {
    id: crypto.randomUUID(),
    url,
    normalizedUrl: normalized,
    timestamp: new Date().toISOString(),
    metrics: {
      pages,
      avgWordsPerPage: avgWords,
      images,
      videos,
      forms,
    },
    stack: {
      platform: platforms[Math.floor(hash * platforms.length)],
      hosting: hostings[Math.floor(hash * hostings.length)],
      technologies: pickTechnologies(technologies, hash),
    },
    pageTypes: [
      { label: "Marketing / static", count: Math.max(3, Math.floor(pages * 0.4)) },
      { label: "Blog / resources", count: Math.max(2, Math.floor(pages * 0.3)) },
      { label: "Landing / campaigns", count: Math.max(1, Math.floor(pages * 0.2)) },
    ],
    recommendations: pickMultiple(recommendationsPool, 3, hash),
    warnings: hash > 0.6 ? pickMultiple(warningsPool, 1, hash / 2) : [],
    complexityScore,
    estimatedHours,
    source: "simulated",
  };
}

function pickTechnologies(list: string[], hash: number) {
  const count = 2 + Math.floor(hash * 3);
  return pickMultiple(list, count, hash);
}

function pickMultiple(array: string[], count: number, hash: number) {
  const copy = [...array];
  const result: string[] = [];
  let seed = hash;
  while (result.length < count && copy.length > 0) {
    seed = (seed * 9301 + 49297) % 233280;
    const index = Math.floor((seed / 233280) * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

function pseudoHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

