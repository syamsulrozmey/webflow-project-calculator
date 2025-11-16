"use client";

import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLatestAnalysis } from "@/hooks/use-latest-analysis";
import type { QuestionnaireAnswerMap } from "@/lib/questionnaire";
import {
  buildCrawlSuggestions,
  type CrawlSuggestion,
} from "@/lib/questionnaire-crawl";
import type { AnalysisResult } from "@/types/analysis";
import { AlertTriangle, ArrowRight, Check, Globe, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface CrawlAssistPanelProps {
  completionPercent: number;
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  answers: QuestionnaireAnswerMap;
  onApplySuggestion?: (suggestion: CrawlSuggestion) => void;
  onApplyAll?: (suggestions: CrawlSuggestion[]) => void;
  isApplying?: boolean;
}

export function CrawlAssistPanel({
  completionPercent,
  entry,
  userType,
  answers,
  onApplySuggestion,
  onApplyAll,
  isApplying = false,
}: CrawlAssistPanelProps) {
  const analysis = useLatestAnalysis();
  const suggestions = useMemo(
    () => buildCrawlSuggestions(analysis, answers),
    [analysis, answers],
  );
  const readyPercent = Math.round(completionPercent * 100);
  const canApply = suggestions.length > 0 && !isApplying;
  const canApplyIndividually = Boolean(onApplySuggestion) && !isApplying;
  const canApplyAll = Boolean(onApplyAll) && canApply;

  const warningSnippet = useMemo(() => {
    if (!analysis || !analysis.warnings.length) {
      return null;
    }
    return analysis.warnings.slice(0, 2);
  }, [analysis]);

  return (
    <Card className="border-primary/20 bg-white/[0.04]">
      <CardHeader className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Crawl assist</p>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Latest site intelligence</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          We stash the most recent crawl so you can pre-fill questionnaire answers with a single tap.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {analysis ? (
          <AnalysisSummary analysis={analysis} entry={entry} userType={userType} readyPercent={readyPercent} />
        ) : (
          <EmptyState />
        )}

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Questionnaire coverage:{" "}
          <span className="text-base font-semibold text-white normal-case">
            {readyPercent}% complete
          </span>
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Recommendations</p>
            <Button
              size="xs"
              variant="ghost"
              className="h-7 gap-1 text-xs text-muted-foreground"
              disabled={!canApplyAll}
              onClick={() => onApplyAll?.(suggestions)}
            >
              Apply all
              <Sparkles className="h-3 w-3 text-primary" />
            </Button>
          </div>
          {analysis ? (
            suggestions.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.questionId}
                    className="rounded-xl border border-white/10 bg-white/[0.01] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {suggestion.label}
                        </p>
                        <p className="text-base text-white">{suggestion.valueLabel}</p>
                        {suggestion.rationale && (
                          <p className="mt-1 text-xs text-muted-foreground">{suggestion.rationale}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/15 text-xs"
                        disabled={!canApplyIndividually}
                        onClick={() => onApplySuggestion?.(suggestion)}
                      >
                        Apply
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Run crawl-driven analysis to unlock suggested answers. We’ll map stacks, CMS counts, and warnings
                to relevant questions automatically.
              </p>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              No crawl data yet. Analyze an existing site first to activate this panel.
            </p>
          )}
        </div>

        {warningSnippet && warningSnippet.length > 0 && (
          <div className="space-y-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100">
            <div className="flex items-center gap-2 text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              Watch outs from crawl
            </div>
            <ul className="space-y-1 text-amber-100">
              {warningSnippet.map((warning) => (
                <li key={warning} className="flex items-start gap-2">
                  <Check className="h-3 w-3 shrink-0 text-amber-200" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
        <Button
          asChild
          variant="outline"
          className="w-full gap-2 border-white/20 text-sm"
        >
          <Link href="/analysis">
            Re-run crawl
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p>
          Latest crawl persists locally so you can resume questionnaire without losing context.
        </p>
      </CardFooter>
    </Card>
  );
}

function AnalysisSummary({
  analysis,
  entry,
  userType,
  readyPercent,
}: {
  analysis: AnalysisResult;
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  readyPercent: number;
}) {
  const entryLabel =
    entry === "fresh" ? "Fresh flow" : entry === "existing" ? "Existing flow" : "Flow TBD";
  const userLabel = userType
    ? userType.charAt(0).toUpperCase() + userType.slice(1)
    : "User type TBD";

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/70">Latest URL</p>
          <p className="text-base text-white">{analysis.normalizedUrl}</p>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <p>{entryLabel}</p>
          <p>{userLabel}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <Metric label="Pages" value={`${analysis.metrics.pages}`} />
        <Metric label="Platform" value={analysis.stack.platform} />
        <Metric label="Complexity" value={`${analysis.complexityScore}/100`} />
        <Metric label="Est. hours" value={`${analysis.estimatedHours}h`} />
      </div>
      <p className="text-xs text-muted-foreground">
        {readyPercent}% questionnaire coverage · last run{" "}
        {new Date(analysis.timestamp).toLocaleDateString()}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.01] px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-2 rounded-xl border border-dashed border-white/15 bg-white/[0.01] p-3 text-sm">
      <p className="text-base text-white">No crawl stored yet.</p>
      <p className="text-xs text-muted-foreground">
        Analyze an existing site to pull CMS counts, stack details, and migration warnings into the questionnaire.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin text-primary" />
        Waiting for first crawl…
      </div>
    </div>
  );
}

