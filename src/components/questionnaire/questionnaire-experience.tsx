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

import { questionnaireSections } from "@/config/questionnaire";
import type {
  EntryFlow,
  QuestionDefinition,
  QuestionnaireAnswer,
  QuestionnaireSection,
  QuestionnaireUserType,
} from "@/config/questionnaire";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  QUESTIONNAIRE_STORAGE_KEY,
  buildDefaultAnswers,
  evaluateVisibility,
  isQuestionAnswered,
  type QuestionnaireAnswerMap,
  type StoredQuestionnaireState,
} from "@/lib/questionnaire";
import { buildCalculationPayload } from "@/lib/calculator/from-answers";
import { saveCalculationResult } from "@/lib/calculator/storage";
import { cn } from "@/lib/utils";
import { useLatestAnalysis } from "@/hooks/use-latest-analysis";
import {
  buildCrawlSuggestions,
  type CrawlSuggestion,
} from "@/lib/questionnaire-crawl";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Clock4,
  CloudDownload,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CalculationResult } from "@/lib/calculator/types";

interface QuestionnaireExperienceProps {
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  sessionId?: string | null;
}

interface SectionState {
  section: QuestionnaireSection;
  baseQuestions: QuestionDefinition[];
  advancedQuestions: QuestionDefinition[];
  visibleQuestions: QuestionDefinition[];
  completionRatio: number;
}

export function QuestionnaireExperience({
  entry,
  userType,
  sessionId,
}: QuestionnaireExperienceProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionnaireAnswerMap>({});
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Record<string, boolean>>(
    {},
  );
  const [showAdvancedSections, setShowAdvancedSections] = useState<
    Record<string, boolean>
  >({});
  const [isRestored, setIsRestored] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<EntryFlow | null>(
    entry ?? null,
  );
  const [selectedUserType, setSelectedUserType] =
    useState<QuestionnaireUserType | null>(userType ?? null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId ?? null,
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<
    Record<string, boolean>
  >({});

  const answersRef = useRef<QuestionnaireAnswerMap>({});
  answersRef.current = answers;
  const sectionStates = useMemo<SectionState[]>(() => {
    return questionnaireSections.map((section) => {
      const visibleQuestions = section.questions.filter((question) =>
        evaluateVisibility(question, answers),
      );

      const baseQuestions = visibleQuestions.filter((q) => !q.advanced);
      const advancedQuestions = visibleQuestions.filter((q) => q.advanced);

      const requiredQuestions = baseQuestions.filter(
        (q) => q.required !== false,
      );
      const answered = requiredQuestions.filter((q) =>
        isQuestionAnswered(q, answers[q.id]),
      );

      return {
        section,
        visibleQuestions,
        baseQuestions,
        advancedQuestions,
        completionRatio:
          requiredQuestions.length === 0
            ? 1
            : answered.length / requiredQuestions.length,
      };
    });
  }, [answers]);

  const activeSectionState = sectionStates[activeSectionIndex];
  const isLastSection = activeSectionIndex === sectionStates.length - 1;
  const analysis = useLatestAnalysis();
  const rawSuggestions = useMemo(
    () => buildCrawlSuggestions(analysis, answers),
    [analysis, answers],
  );
  const suggestionMap = useMemo(() => {
    return rawSuggestions.reduce<Record<string, CrawlSuggestion>>((acc, suggestion) => {
      if (dismissedSuggestions[suggestion.questionId]) {
        return acc;
      }
      acc[suggestion.questionId] = suggestion;
      return acc;
    }, {});
  }, [rawSuggestions, dismissedSuggestions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);
    const effectiveUserType = userType ?? null;
    const incomingSession = sessionId ?? null;

    const hydrateWithDefaults = () => {
      setAnswers(buildDefaultAnswers(questionnaireSections, effectiveUserType));
      setSkippedQuestions({});
      setShowAdvancedSections({});
    };

    if (!stored) {
      hydrateWithDefaults();
      setActiveSessionId(incomingSession);
      setIsRestored(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredQuestionnaireState;
      const storedSession = parsed.sessionId ?? null;
      const shouldHydrateFromStorage =
        !incomingSession ||
        (storedSession !== null && storedSession === incomingSession);

      if (!shouldHydrateFromStorage && incomingSession) {
        hydrateWithDefaults();
        setActiveSessionId(incomingSession);
        setIsRestored(true);
        return;
      }

      const defaults = buildDefaultAnswers(
        questionnaireSections,
        parsed.userType ?? effectiveUserType,
      );
      setAnswers({ ...defaults, ...parsed.answers });
      setSkippedQuestions(parsed.skipped ?? {});
      setShowAdvancedSections(parsed.showAdvanced ?? {});
      if (!entry && parsed.entry) {
        setSelectedEntry(parsed.entry);
      }
      if (!userType && parsed.userType) {
        setSelectedUserType(parsed.userType);
      }
      setActiveSessionId(storedSession ?? incomingSession);
    } catch (error) {
      console.warn("Failed to parse questionnaire state", error);
      hydrateWithDefaults();
      setActiveSessionId(incomingSession);
    } finally {
      setIsRestored(true);
    }
  }, [entry, userType, sessionId]);

  useEffect(() => {
    setDismissedSuggestions({});
  }, [analysis?.id]);

  useEffect(() => {
    if (entry) {
      setSelectedEntry(entry);
    }
  }, [entry]);

  useEffect(() => {
    if (userType) {
      setSelectedUserType(userType);
    }
  }, [userType]);

  useEffect(() => {
    if (!isRestored || typeof window === "undefined") return;
    const payload: StoredQuestionnaireState = {
      answers,
      skipped: skippedQuestions,
      showAdvanced: showAdvancedSections,
      entry: selectedEntry,
      userType: selectedUserType,
      sessionId: activeSessionId,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(QUESTIONNAIRE_STORAGE_KEY, JSON.stringify(payload));
  }, [
    answers,
    skippedQuestions,
    showAdvancedSections,
    selectedEntry,
    selectedUserType,
    activeSessionId,
    isRestored,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = window.setInterval(() => {
      const payload: StoredQuestionnaireState = {
        answers: answersRef.current,
        skipped: skippedQuestions,
        showAdvanced: showAdvancedSections,
        entry: selectedEntry,
        userType: selectedUserType,
        sessionId: activeSessionId,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(
        QUESTIONNAIRE_STORAGE_KEY,
        JSON.stringify(payload),
      );
    }, 30000);
    return () => window.clearInterval(interval);
  }, [
    selectedEntry,
    skippedQuestions,
    showAdvancedSections,
    selectedUserType,
    activeSessionId,
  ]);

  const totalRequiredQuestions = useMemo(() => {
    return sectionStates.reduce((count, state) => {
      const required = state.baseQuestions.filter((q) => q.required !== false);
      return count + required.length;
    }, 0);
  }, [sectionStates]);

  const totalCompletedRequired = useMemo(() => {
    return sectionStates.reduce((count, state) => {
      const answered = state.baseQuestions.filter(
        (q) => q.required !== false && isQuestionAnswered(q, answers[q.id]),
      );
      return count + answered.length;
    }, 0);
  }, [answers, sectionStates]);

  const overallProgress =
    totalRequiredQuestions === 0
      ? 1
      : totalCompletedRequired / totalRequiredQuestions;
  const canCalculate = overallProgress >= 1 && !isCalculating;

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSkippedQuestions((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? (prev[questionId] as string[]) : [];
      const exists = current.includes(value);
      const updated = exists
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleScaleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleToggle = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSkipQuestion = (questionId: string, skip = true) => {
    setSkippedQuestions((prev) => {
      const updated = { ...prev };
      if (skip) {
        updated[questionId] = true;
      } else {
        delete updated[questionId];
      }
      return updated;
    });
    if (skip) {
      setAnswers((prev) => ({ ...prev, [questionId]: null }));
    }
  };

  const handleClearSection = (sectionId: string) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      const section = questionnaireSections.find((s) => s.id === sectionId);
      section?.questions.forEach((question) => {
        delete updated[question.id];
      });
      return updated;
    });
  };

  const handleReset = () => {
    setAnswers(buildDefaultAnswers(questionnaireSections, selectedUserType));
    setSkippedQuestions({});
    setShowAdvancedSections({});
    setActiveSectionIndex(0);
  };

  const handleCalculate = async () => {
    if (!canCalculate || isCalculating) return;
    setIsCalculating(true);
    setCalculationError(null);
    try {
      const { input, metadata } = buildCalculationPayload({
        answers,
        entry: selectedEntry,
        userType: selectedUserType,
      });
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: CalculationResult;
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to calculate cost right now.");
      }
      saveCalculationResult({
        result: payload.data,
        recordedAt: Date.now(),
        source: "questionnaire",
        meta: metadata,
      });
      router.push("/results?source=questionnaire");
    } catch (error) {
      setCalculationError(
        error instanceof Error ? error.message : "Unable to calculate cost right now.",
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApplySuggestion = (suggestion: CrawlSuggestion) => {
    setAnswers((prev) => ({ ...prev, [suggestion.questionId]: suggestion.value }));
    setSkippedQuestions((prev) => {
      const next = { ...prev };
      delete next[suggestion.questionId];
      return next;
    });
    setDismissedSuggestions((prev) => {
      const next = { ...prev };
      delete next[suggestion.questionId];
      return next;
    });
  };

  const handleDismissSuggestion = (questionId: string) => {
    setDismissedSuggestions((prev) => ({ ...prev, [questionId]: true }));
  };

  if (!isRestored || !activeSectionState) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const displayedQuestions = [
    ...activeSectionState.baseQuestions,
    ...(showAdvancedSections[activeSectionState.section.id]
      ? activeSectionState.advancedQuestions
      : []),
  ];

  const hasAdvancedQuestions = activeSectionState.advancedQuestions.length > 0;

  return (
    <div className="space-y-8">
      <Card
        id="questionnaire-progress-card"
        className="border-white/10 bg-gradient-to-r from-[#0b0f1f] to-[#090b16]"
      >
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80">
                Project context
              </p>
              <p className="text-base text-muted-foreground">
                {selectedEntry
                  ? selectedEntry === "fresh"
                    ? "Fresh build flow"
                    : "Existing site analysis"
                  : "Select flow"}
                {" · "}
                {selectedUserType
                  ? selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)
                  : "User type TBD"}
              </p>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(overallProgress * 100)}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(overallProgress * 100)}% complete
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/20" onClick={handleReset}>
                Reset answers
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                <Link href="/onboarding">Back to onboarding</Link>
              </Button>
            </div>
          </div>
          <Stepper
            sections={sectionStates}
            activeIndex={activeSectionIndex}
            onSelect={setActiveSectionIndex}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="flex flex-col gap-4 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <activeSectionState.section.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary/70">
                  {activeSectionState.section.badge}
                </p>
                <CardTitle>{activeSectionState.section.title}</CardTitle>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {activeSectionState.section.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                {Math.round(activeSectionState.completionRatio * 100)}% of base questions answered
              </span>
              <span className="h-1 rounded-full bg-white/10 px-1" />
              <button
                type="button"
                className="inline-flex items-center gap-1 text-primary hover:underline"
                onClick={() => handleClearSection(activeSectionState.section.id)}
              >
                Clear section
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {displayedQuestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                No questions to show yet. Adjust previous answers or reveal advanced prompts.
              </div>
            ) : (
              displayedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  onSingleSelect={handleSingleSelect}
                  onMultiSelect={handleMultiSelect}
                  onScaleChange={handleScaleChange}
                  onToggle={handleToggle}
                  onTextChange={handleTextChange}
                  onSkip={handleSkipQuestion}
                  skipped={skippedQuestions[question.id]}
                  suggestion={suggestionMap[question.id]}
                  onAcceptSuggestion={handleApplySuggestion}
                  onDismissSuggestion={handleDismissSuggestion}
                />
              ))
            )}

            {hasAdvancedQuestions && !showAdvancedSections[activeSectionState.section.id] && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Advanced questions available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tackle complex requirements now or skip—they’re optional.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20"
                      onClick={() =>
                        setShowAdvancedSections((prev) => ({
                          ...prev,
                          [activeSectionState.section.id]: true,
                        }))
                      }
                    >
                      Show advanced
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const advancedIds = activeSectionState.advancedQuestions.map(
                          (q) => q.id,
                        );
                        setSkippedQuestions((prev) => {
                          const updated = { ...prev };
                          advancedIds.forEach((id) => {
                            updated[id] = true;
                          });
                          return updated;
                        });
                        setAnswers((prev) => {
                          const updated = { ...prev };
                          advancedIds.forEach((id) => {
                            updated[id] = null;
                          });
                          return updated;
                        });
                      }}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              className="w-full gap-2 text-muted-foreground sm:w-auto"
              onClick={() =>
                setActiveSectionIndex((index) => Math.max(0, index - 1))
              }
              disabled={activeSectionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              className="w-full gap-2 sm:w-auto"
              onClick={() => {
                if (isLastSection) {
                  if (typeof window !== "undefined") {
                    const target = document.getElementById("questionnaire-progress-card");
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }
                  return;
                }
                setActiveSectionIndex((index) =>
                  Math.min(sectionStates.length - 1, index + 1),
                );
              }}
            >
              {isLastSection ? (
                <>
                  Review progress
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next section
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <aside className="space-y-4">
          <InsightCard kicker="Auto-save" title="Progress saved every 30 seconds" icon={CloudDownload}>
            <p>Feel free to close the tab—your answers stay synced locally.</p>
          </InsightCard>

          <InsightCard kicker="Checklist" title="What’s left?" icon={ClipboardList}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {sectionStates.map((state) => (
                <li key={state.section.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-foreground">{state.section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(state.completionRatio * 100)}% base coverage
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </InsightCard>

          <InsightCard kicker="Next step" title="Ready for calculation?" icon={Sparkles}>
            <p className="text-sm text-muted-foreground">
              Once every section hits 100%, send answers to the deterministic cost engine.
            </p>
            <Button
              className="mt-3 w-full gap-2"
              variant="outline"
              disabled={!canCalculate}
              onClick={handleCalculate}
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating…
                </>
              ) : (
                <>
                  Calculate project cost
                  <Sparkles className="h-4 w-4 text-primary" />
                </>
              )}
            </Button>
            {overallProgress < 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Answer all required questions to unlock the calculator.
              </p>
            )}
            {calculationError && (
              <p className="mt-2 text-xs text-destructive">{calculationError}</p>
            )}
          </InsightCard>

          <InsightCard kicker="Reminder" title="Timeline tips" icon={Clock4}>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Rush projects + multiple approvers trigger urgency multipliers.</li>
              <li>Retainers unlock maintenance revenue lines.</li>
            </ul>
          </InsightCard>
        </aside>
      </div>
    </div>
  );
}

function Stepper({
  sections,
  activeIndex,
  onSelect,
}: {
  sections: SectionState[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-6 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
      {sections.map((state, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={state.section.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "border-primary/60 bg-white/[0.05]"
                : "border-white/10 bg-transparent hover:border-primary/30",
            )}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span>{index + 1}</span>
              {state.completionRatio === 1 && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-white">
              {state.section.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(state.completionRatio * 100)}% base done
            </p>
          </button>
        );
      })}
    </div>
  );
}

function QuestionCard({
  question,
  answer,
  skipped,
  suggestion,
  onSingleSelect,
  onMultiSelect,
  onScaleChange,
  onToggle,
  onTextChange,
  onSkip,
  onAcceptSuggestion,
  onDismissSuggestion,
}: {
  question: QuestionDefinition;
  answer: QuestionnaireAnswer;
  skipped?: boolean;
  suggestion?: CrawlSuggestion;
  onSingleSelect: (id: string, value: string) => void;
  onMultiSelect: (id: string, value: string) => void;
  onScaleChange: (id: string, value: number) => void;
  onToggle: (id: string, value: boolean) => void;
  onTextChange: (id: string, value: string) => void;
  onSkip: (id: string, skip?: boolean) => void;
  onAcceptSuggestion?: (suggestion: CrawlSuggestion) => void;
  onDismissSuggestion?: (questionId: string) => void;
}) {
  const suggestionApplied =
    suggestion && answersEqual(answer, suggestion.value);
  const showSuggestion = Boolean(suggestion && !skipped && !suggestionApplied);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/[0.01] p-5 transition-shadow duration-300",
        showSuggestion
          ? "border-primary/40 bg-primary/5 shadow-[0_0_25px_rgba(129,140,248,0.2)]"
          : "border-white/10",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-white">
              {question.title}
            </p>
            {question.tooltip && (
              <Tooltip label={question.tooltip} />
            )}
            {question.advanced && (
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Advanced
              </span>
            )}
          </div>
          {question.description && (
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
          )}
          {question.helper && (
            <p className="text-xs text-muted-foreground/80">
              {question.helper}
            </p>
          )}
        </div>
        {question.advanced && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-white"
            onClick={() => onSkip(question.id, true)}
          >
            Skip question
          </button>
        )}
      </div>
      {showSuggestion && suggestion && (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI suggestion
          </div>
          <p className="text-sm font-semibold text-white">{suggestion.valueLabel}</p>
          {suggestion.rationale && (
            <p className="text-xs text-primary/80">{suggestion.rationale}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 gap-1 border-primary/40 bg-primary/90 text-xs"
              onClick={() => onAcceptSuggestion?.(suggestion)}
            >
              Accept
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-white/20 text-xs text-muted-foreground"
              onClick={() => onDismissSuggestion?.(question.id)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {skipped && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
            Skipped for now — revisit any time.
          </div>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => onSkip(question.id, false)}
          >
            Resume
          </button>
        </div>
      )}
      {!skipped && (
        <div className="mt-4">
          {renderByType(question, answer, {
            onSingleSelect,
            onMultiSelect,
            onScaleChange,
            onToggle,
            onTextChange,
          })}
        </div>
      )}
    </div>
  );
}

function answersEqual(a: QuestionnaireAnswer, b: QuestionnaireAnswer): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((value, index) => value === sortedB[index]);
  }
  return a === b;
}

function renderByType(
  question: QuestionDefinition,
  answer: QuestionnaireAnswer,
  handlers: {
    onSingleSelect: (id: string, value: string) => void;
    onMultiSelect: (id: string, value: string) => void;
    onScaleChange: (id: string, value: number) => void;
    onToggle: (id: string, value: boolean) => void;
    onTextChange: (id: string, value: string) => void;
  },
) {
  switch (question.type) {
    case "single":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {question.options?.map((option) => {
            const isSelected = answer === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlers.onSingleSelect(question.id, option.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/30",
                )}
              >
                <p className="text-sm font-medium text-white">{option.label}</p>
                {option.description && (
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                )}
                {option.badge && (
                  <span className="mt-2 inline-block rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {option.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    case "multi":
      return (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => {
            const selections = Array.isArray(answer) ? (answer as string[]) : [];
            const isSelected = selections.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlers.onMultiSelect(question.id, option.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition text-white",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-white/15 text-white/70 hover:border-white/40 hover:text-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    case "scale":
      return (
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{question.min}</span>
            <span>{question.max}</span>
          </div>
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step ?? 1}
            value={typeof answer === "number" ? answer : question.min}
            onChange={(event) =>
              handlers.onScaleChange(question.id, Number(event.target.value))
            }
            className="mt-2 w-full accent-primary"
          />
          <div className="mt-1 text-sm text-white">
            {typeof answer === "number" ? answer : question.min}
          </div>
        </div>
      );
    case "toggle":
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handlers.onToggle(question.id, !(answer as boolean))}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full border border-white/15 transition",
              answer ? "bg-primary/80" : "bg-white/10",
            )}
            role="switch"
            aria-checked={Boolean(answer)}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white transition",
                answer ? "translate-x-5" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {answer ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
    case "text":
      return (
        <textarea
          value={typeof answer === "string" ? answer : ""}
          onChange={(event) => handlers.onTextChange(question.id, event.target.value)}
          placeholder={question.placeholder}
          className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm text-white outline-none ring-primary/40 focus:ring"
          rows={4}
        />
      );
    default:
      return null;
  }
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="relative group">
      <HelpCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
      <div className="pointer-events-none absolute left-1/2 top-full mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-background p-3 text-xs text-muted-foreground shadow-2xl group-hover:block">
        {label}
      </div>
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
        <p className="text-xs uppercase tracking-[0.3em] text-primary/70">{kicker}</p>
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

