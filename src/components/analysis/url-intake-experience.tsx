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
  QUESTIONNAIRE_STORAGE_KEY,
  type StoredQuestionnaireState,
} from "@/lib/questionnaire";
import { readUserContext } from "@/lib/user-context";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock4,
  Globe,
  History,
  Info,
  Loader2,
  PlugZap,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  sessionId?: string | null;
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
  sessionId,
}: UrlIntakeExperienceProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTransitioningToQuestionnaire, setIsTransitioningToQuestionnaire] =
    useState(false);
  const effectiveEntry: EntryFlow = entry ?? "existing";
  const effectiveUserType = userType ?? null;

  const [displayUserType, setDisplayUserType] = useState<QuestionnaireUserType | null>(
    effectiveUserType,
  );

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      setHistory(stored ? (JSON.parse(stored) as AnalysisResult[]) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    setDisplayUserType(effectiveUserType);
  }, [effectiveUserType]);

  useEffect(() => {
  if (effectiveUserType || typeof window === "undefined") {
    return;
  }
  const storedContext = readUserContext();
  if (storedContext?.userType) {
    setDisplayUserType(storedContext.userType);
    return;
  }
  try {
    const stored = window.localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored) as StoredQuestionnaireState;
    if (parsed.userType) {
      setDisplayUserType(parsed.userType);
    }
  } catch {
    // ignore
  }
}, [effectiveUserType]);

  const ctaHref = buildFlowHref("/questionnaire", "existing", effectiveUserType, {
    session: sessionId ?? undefined,
  });

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

  const crawlCompletionPercent = useMemo(() => {
    if (status === "completed") {
      return 100;
    }
    if (status === "idle" || status === "error") {
      return 0;
    }
    const totalPhases = crawlPhases.length;
    const clampedIndex = Math.min(phaseIndex, totalPhases);
    return Math.round((clampedIndex / totalPhases) * 100);
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

  const normalizedCrawlPercent = Math.min(
    Math.max(crawlCompletionPercent, 0),
    100,
  );

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

  const handleContinueToQuestionnaire = () => {
    if (!result || isTransitioningToQuestionnaire) {
      return;
    }
    setIsTransitioningToQuestionnaire(true);
    window.setTimeout(() => {
      router.push(ctaHref);
    }, 700);
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
      <Card className="bg-white border-conv-border shadow-card">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs text-conv-primary uppercase tracking-wider">
                Existing site analysis
              </p>
              <CardTitle className="font-serif text-3xl font-normal tracking-tight text-conv-text-primary">
                Capture the current footprint before migrating.
              </CardTitle>
              <p className="text-sm text-conv-text-secondary">
                We'll crawl the URL, detect stack + complexity, and feed it into
                the streamlined questionnaire.
              </p>
            </div>
            <div className="rounded-2xl border border-conv-border bg-conv-background-alt px-4 py-3 text-xs text-conv-text-secondary">
              <p>
                Context:{" "}
                <span className="text-conv-text-primary font-medium">
                  {effectiveEntry === "existing" ? "Existing site flow" : "Flow TBD"}
                </span>
              </p>
              <p>
                User type:{" "}
                <span className="text-conv-text-primary font-medium">
                  {displayUserType
                    ? displayUserType.charAt(0).toUpperCase() + displayUserType.slice(1)
                    : "Not set"}
                </span>
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-3">
              <label className="text-sm font-medium text-conv-text-primary">
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
                      "w-full rounded-xl border bg-white px-4 py-3 text-base text-conv-text-primary outline-none transition focus:ring-2",
                      error
                        ? "border-destructive focus:ring-destructive/40"
                        : "border-conv-border focus:ring-conv-primary/40",
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
              <div className="flex flex-wrap gap-2 text-xs text-conv-text-secondary">
                {exampleUrls.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-full border border-conv-border px-3 py-1 transition hover:border-conv-primary hover:text-conv-text-primary"
                    onClick={() => handleExampleClick(example)}
                    disabled={isAnalyzing}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-conv-border bg-conv-background-alt p-4 text-sm text-conv-text-secondary">
              <p className="flex items-center gap-2 text-conv-text-primary font-medium">
                <Info className="h-4 w-4 text-conv-primary" />
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
        <CardFooter className="flex flex-wrap items-center gap-3 border-t border-conv-border px-6 py-4 text-xs text-conv-text-secondary">
          <div className="flex items-center gap-2">
            <PlugZap className="h-3.5 w-3.5 text-conv-primary" />
            Firecrawl-ready placeholder
          </div>
          <div className="flex items-center gap-2">
            <Clock4 className="h-3.5 w-3.5 text-conv-primary" />
            Autosaves last 4 analyses
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-conv-primary" />
            Deterministic summary for questionnaire
          </div>
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="bg-white border-conv-border shadow-card">
            <CardHeader className="border-b border-conv-border">
              <p className="text-xs text-conv-primary uppercase tracking-wider">
                Crawl progress
              </p>
              <CardTitle className="text-2xl text-conv-text-primary">Status timeline</CardTitle>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-conv-text-secondary">
                  <span>Summarizing progress</span>
                  <span className="text-conv-text-primary font-medium">{normalizedCrawlPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-conv-border">
                  <div
                    className="h-1.5 rounded-full bg-conv-primary transition-all"
                    style={{ width: `${normalizedCrawlPercent}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {status === "completed" ? (
                <div className="rounded-2xl border border-conv-border bg-conv-background-alt p-4 text-sm text-conv-text-secondary">
                  <p className="text-xs text-conv-primary uppercase tracking-wider">
                    Crawl finished
                  </p>
                  <p className="text-conv-text-primary">
                    We captured the latest snapshot. Review the summary below or rerun a new URL.
                  </p>
                </div>
              ) : (
                <Timeline phases={phaseProgress} />
              )}
              {notice && (
                <div className="flex items-start gap-2 rounded-xl border border-conv-primary/30 bg-conv-primary/5 px-4 py-3 text-sm text-conv-text-primary">
                  <Info className="mt-0.5 h-4 w-4 text-conv-primary" />
                  {notice}
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-white border-conv-border shadow-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-conv-primary" />
                  <div>
                    <p className="text-xs text-conv-primary uppercase tracking-wider">
                      Crawl summary
                    </p>
                    <CardTitle className="text-2xl text-conv-text-primary">Site insights</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <SummaryDetails result={result} progressPercent={normalizedCrawlPercent} />
              </CardContent>
            </Card>
          )}

          {status === "completed" && result && (
            <div className="rounded-2xl border border-conv-border bg-white shadow-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs text-conv-primary uppercase tracking-wider">
                    Ready for questionnaire
                  </p>
                  <p className="font-serif text-xl font-normal leading-tight tracking-tight text-conv-text-primary">
                    {result.normalizedUrl}
                  </p>
                  <p className="text-sm text-conv-text-secondary">
                    {result.metrics.pages} pages · {result.stack.platform} ·{" "}
                    {result.stack.technologies.slice(0, 2).join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2 shadow-button"
                    onClick={handleContinueToQuestionnaire}
                    disabled={isTransitioningToQuestionnaire}
                  >
                    {isTransitioningToQuestionnaire ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Preparing AI suggestions…
                      </>
                    ) : (
                      <>
                        Continue to questionnaire
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-conv-border text-conv-text-primary hover:bg-white"
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
        </div>

        <aside className="space-y-4">
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
                    className="w-full rounded-xl border border-conv-border bg-conv-background-alt px-4 py-3 text-left transition hover:border-conv-primary hover:shadow-card"
                    onClick={() => handleHistorySelect(record)}
                  >
                      <p className="text-sm text-conv-text-primary">{record.normalizedUrl}</p>
                      <p className="text-xs text-conv-text-secondary">
                        {formatHistoryDate(record.timestamp)}
                      </p>
                  </button>
                ))}
              </div>
            )}
          </InsightCard>

          <InsightCard kicker="Next step" title="What happens after?" icon={BarChart3}>
            <ul className="space-y-2 text-xs text-conv-text-secondary">
              <li>Streamlined questionnaire focuses on deltas & improvements.</li>
              <li>Deterministic engine merges crawl metrics + answers.</li>
              <li>Exports highlight migration scope vs net-new work.</li>
            </ul>
          </InsightCard>
        </aside>
      </div>
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
              ? "border-conv-primary/60 bg-conv-primary/10"
              : phase.state === "active"
                ? "border-conv-primary/40 bg-conv-background-alt"
                : "border-conv-border",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-conv-border">
            {phase.state === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-conv-primary" />
            ) : phase.state === "active" ? (
              <Loader2 className="h-5 w-5 animate-spin text-conv-primary" />
            ) : (
              <span className="text-sm text-conv-text-secondary">
                {index + 1}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-conv-text-primary">{phase.label}</p>
            <p className="text-xs text-conv-text-secondary">{phase.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SummaryDetails({
  result,
  progressPercent,
}: {
  result: AnalysisResult;
  progressPercent: number;
}) {
  const clamped = Math.min(Math.max(progressPercent, 0), 100);
  return (
    <>
      <div className="space-y-1">
        <p className="text-[11px] text-conv-primary uppercase tracking-wider">
          Crawl progress
        </p>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-conv-border">
            <div
              className="h-1.5 rounded-full bg-conv-primary transition-all"
              style={{ width: `${clamped}%` }}
            />
          </div>
          <span className="text-xs text-conv-text-primary font-medium">{clamped}%</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Pages discovered",
            value: result.metrics.pages,
            hint: "Free-tier crawl scans up to 35 pages per URL.",
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
            className="rounded-2xl border border-conv-border bg-conv-background-alt px-4 py-3 text-sm"
          >
            <p className="text-xs text-conv-text-secondary">
              {item.label}
            </p>
            <p className="text-xl font-semibold text-conv-text-primary">{item.value}</p>
            {item.hint && (
              <p className="text-[11px] text-conv-text-muted">{item.hint}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-conv-border bg-conv-background-alt p-4">
          <p className="text-xs text-conv-primary uppercase tracking-wider">
            Technology stack
          </p>
          <p className="text-sm text-conv-text-secondary">
            {result.stack.platform} on {result.stack.hosting}
          </p>
          <p className="text-[11px] text-conv-text-muted">
            Detected from current crawl sample — not a full inventory.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-conv-text-secondary">
            {result.stack.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-conv-border bg-white px-3 py-1">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-conv-border bg-conv-background-alt p-4">
          <p className="text-xs text-conv-primary uppercase tracking-wider">
            Complexity score
          </p>
          <div className="flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-conv-border">
              <div
                className="h-2 rounded-full bg-conv-primary"
                style={{ width: `${result.complexityScore}%` }}
              />
            </div>
            <span className="text-2xl font-semibold text-conv-text-primary">
              {result.complexityScore}
            </span>
          </div>
          <p className="text-xs text-conv-text-secondary">
            Estimated {result.estimatedHours} hours to rebuild / migrate.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="font-serif text-base font-normal leading-tight tracking-tight text-conv-primary">
            Page mix
          </h3>
          {result.pageTypes.some((item) => item.count > 0) ? (
            <ul className="space-y-2 text-sm text-conv-text-secondary">
              {result.pageTypes.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full border border-conv-border bg-white px-3 py-0.5 text-xs">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-conv-text-secondary">
              Page mix will populate once the crawl finds pages with distinct paths.
            </p>
          )}
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-base font-normal leading-tight tracking-tight text-conv-primary">
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm text-conv-text-secondary">
            {result.recommendations.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-conv-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-900">Watch outs</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatHistoryDate(value: string) {
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
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
    <Card className="bg-white border-conv-border shadow-card">
      <CardHeader className="pb-2">
        <p className="text-xs text-conv-primary uppercase tracking-wider">
          {kicker}
        </p>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-conv-primary" />
          <CardTitle className="text-base text-conv-text-primary">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-conv-text-secondary">
        {children}
      </CardContent>
    </Card>
  );
}

function PlaceholderText({ children }: { children: ReactNode }) {
  return <p className="text-sm text-conv-text-secondary">{children}</p>;
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

