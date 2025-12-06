"use client";

import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AgencyTeamConfigurator } from "@/components/agency/team-configurator";
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
import {
  SUPPORTED_CURRENCIES,
  buildCalculationPayload,
  type SupportedCurrency,
} from "@/lib/calculator/from-answers";
import { saveCalculationResult } from "@/lib/calculator/storage";
import { cn } from "@/lib/utils";
import { useLatestAnalysis } from "@/hooks/use-latest-analysis";
import { useAgencyTeamConfig } from "@/hooks/use-agency-team";
import type { AgencyRateSummary } from "@/lib/agency/types";
import { useProjects } from "@/hooks/use-projects";
import { formatFxRelativeTime, useCurrencyRates } from "@/hooks/use-currency-rates";
import {
  buildCrawlSuggestions,
  type CrawlSuggestion,
} from "@/lib/questionnaire-crawl";
import { readUserContext } from "@/lib/user-context";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  CloudDownload,
  CloudUpload,
  DollarSign,
  HelpCircle,
  Loader2,
  Shield,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CalculationResult } from "@/lib/calculator/types";
import type { ProjectDetail, ProjectRequestPayload } from "@/lib/projects/types";

interface QuestionnaireExperienceProps {
  entry?: EntryFlow | null;
  userType?: QuestionnaireUserType | null;
  sessionId?: string | null;
  projectId?: string | null;
}

interface SectionState {
  section: QuestionnaireSection;
  baseQuestions: QuestionDefinition[];
  advancedQuestions: QuestionDefinition[];
  visibleQuestions: QuestionDefinition[];
  completionRatio: number;
}

interface InsightCardContent {
  kicker: string;
  title: string;
  body: ReactNode;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

const ENTRY_FLOW_CHOICES: { id: EntryFlow; label: string }[] = [
  { id: "fresh", label: "Fresh build" },
  { id: "existing", label: "Existing site analysis" },
];

const USER_TYPE_CHOICES: { id: QuestionnaireUserType; label: string }[] = [
  { id: "freelancer", label: "Freelancer" },
  { id: "agency", label: "Agency" },
  { id: "company", label: "Company" },
];

const CURRENCY_DISPLAY = {
  usd: { symbol: "$", code: "USD" },
  eur: { symbol: "€", code: "EUR" },
  gbp: { symbol: "£", code: "GBP" },
} as const;

type CurrencyDisplayKey = keyof typeof CURRENCY_DISPLAY;

function isCurrencyDisplayKey(value: string): value is CurrencyDisplayKey {
  return value in CURRENCY_DISPLAY;
}

export function QuestionnaireExperience({
  entry,
  userType,
  sessionId,
  projectId,
}: QuestionnaireExperienceProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionnaireAnswerMap>({});
  const [touchedQuestions, setTouchedQuestions] = useState<Record<string, boolean>>({});
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Record<string, boolean>>({});
  const [showAdvancedSections, setShowAdvancedSections] = useState<Record<string, boolean>>({});
  const [selectedEntry, setSelectedEntry] = useState<EntryFlow | null>(entry ?? null);
  const [selectedUserType, setSelectedUserType] =
    useState<QuestionnaireUserType | null>(userType ?? null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionId ?? projectId ?? null,
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Record<string, boolean>>({});
  const [projectTitle, setProjectTitle] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projectId ?? null);
  const [projectSyncMessage, setProjectSyncMessage] = useState<string | null>(null);
  const [projectSyncError, setProjectSyncError] = useState<string | null>(null);
  const [isProjectSaving, setIsProjectSaving] = useState(false);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [isLocalHydrated, setIsLocalHydrated] = useState(false);
  const [isProjectHydrated, setIsProjectHydrated] = useState(projectId ? false : true);
  const [isRestored, setIsRestored] = useState(false);
  const [prefilledByPersona, setPrefilledByPersona] = useState<
    Record<string, QuestionnaireUserType | null>
  >({});
  const [isAgencyConfiguratorOpen, setAgencyConfiguratorOpen] = useState(false);
  const selectedCurrencyAnswer = answers["rate_currency"];
  const selectedCurrencyKey: CurrencyDisplayKey =
    typeof selectedCurrencyAnswer === "string" && isCurrencyDisplayKey(selectedCurrencyAnswer)
      ? selectedCurrencyAnswer
      : "usd";
  const selectedCurrencyDisplay = CURRENCY_DISPLAY[selectedCurrencyKey];
  const { fetchProjectDetail, createProject, updateProject } = useProjects({
    autoFetch: false,
  });
  const {
    state: agencyTeamState,
    summary: agencySummary,
    upsertMember,
    removeMember,
    updateSettings: updateAgencySettings,
    resetState: resetAgencyTeam,
  } = useAgencyTeamConfig(activeSessionId);
  const {
    rates: currencyRates,
    loading: isCurrencyLoadingRates,
    error: currencyError,
    refresh: refreshCurrencyRates,
    convert: convertCurrencyValue,
  } = useCurrencyRates();
  const previousCurrencyRef = useRef<CurrencyDisplayKey>(selectedCurrencyKey);
  const [isRateAutoConversionPaused, setIsRateAutoConversionPaused] = useState(false);
  const [manualConversionContext, setManualConversionContext] = useState<{
    from: CurrencyDisplayKey;
    to: CurrencyDisplayKey;
  } | null>(null);

  const applyProjectDetail = useCallback(
    (detail: ProjectDetail) => {
      const incomingAnswers = detail.answers ?? {};
      setAnswers(incomingAnswers);
      setSkippedQuestions({});
      setShowAdvancedSections({});
      setTouchedQuestions(deriveTouchedFromAnswers(incomingAnswers));
      setSelectedEntry(detail.flow);
      setSelectedUserType(detail.persona ?? null);
      setActiveProjectId(detail.id);
      setActiveSessionId(detail.id);
      setProjectTitle(detail.title);
      setDismissedSuggestions({});
      const incomingCurrency = incomingAnswers["rate_currency"];
      if (typeof incomingCurrency === "string" && isCurrencyDisplayKey(incomingCurrency)) {
        previousCurrencyRef.current = incomingCurrency;
      } else {
        previousCurrencyRef.current = "usd";
      }
      setIsRateAutoConversionPaused(false);
      setManualConversionContext(null);
    },
    [],
  );

  useEffect(() => {
    if (isLocalHydrated && isProjectHydrated) {
      setIsRestored(true);
    }
  }, [isLocalHydrated, isProjectHydrated]);

  const clearPersonaPrefill = useCallback((questionId: string) => {
    setPrefilledByPersona((prev) => {
      if (!prev[questionId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const markTouched = (questionId: string) => {
    setTouchedQuestions((prev) => {
      if (prev[questionId]) {
        return prev;
      }
      return { ...prev, [questionId]: true };
    });
    clearPersonaPrefill(questionId);
  };

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
      const answered = requiredQuestions.filter(
        (q) => touchedQuestions[q.id] && isQuestionAnswered(q, answers[q.id]),
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
  }, [answers, touchedQuestions]);

  const activeSectionState = sectionStates[activeSectionIndex];
  const isLastSection = activeSectionIndex === sectionStates.length - 1;
  const analysis = useLatestAnalysis();
  const rawSuggestions = useMemo(() => {
    if (selectedEntry !== "existing") {
      return [];
    }
    return buildCrawlSuggestions(analysis, answers);
  }, [analysis, answers, selectedEntry]);
  const suggestionMap = useMemo(() => {
    return rawSuggestions.reduce<Record<string, CrawlSuggestion>>((acc, suggestion) => {
      if (dismissedSuggestions[suggestion.questionId]) {
        return acc;
      }
      acc[suggestion.questionId] = suggestion;
      return acc;
    }, {});
  }, [rawSuggestions, dismissedSuggestions]);
  const hasTouchedHourlyRate = Boolean(touchedQuestions["hourly_rate"]);
  const hourlyRateValue = answers["hourly_rate"];
  const formattedHourlyRate =
    typeof hourlyRateValue === "number" && !Number.isNaN(hourlyRateValue)
      ? hourlyRateValue
      : null;
  const currencyHelperCopy = useMemo(() => {
    let base = "Using default FX baseline until live rates load.";
    if (isCurrencyLoadingRates) {
      base = "Fetching live FX rates…";
    } else if (currencyError) {
      base = `${currencyError} · Falling back to the last cached rates.`;
    } else if (currencyRates) {
      const freshness = formatFxRelativeTime(currencyRates);
      const freshnessLabel = freshness ? `updated ${freshness}` : "synced";
      base = `Live ${currencyRates.base.toUpperCase()} FX (${currencyRates.stale ? "cached" : "live"}) · ${freshnessLabel}.`;
    }
    if (manualConversionContext) {
      return `${base} Hourly rate left untouched after your last manual edit.`;
    }
    return base;
  }, [
    currencyError,
    currencyRates,
    isCurrencyLoadingRates,
    manualConversionContext,
  ]);

  useEffect(() => {
    const previousCurrency = previousCurrencyRef.current;
    if (selectedCurrencyKey === previousCurrency) {
      return;
    }
    previousCurrencyRef.current = selectedCurrencyKey;
    const currentValue = answersRef.current["hourly_rate"];
    const numericRate =
      typeof currentValue === "number" && !Number.isNaN(currentValue) ? currentValue : null;
    if (!numericRate) {
      setManualConversionContext(null);
      return;
    }
    if (isRateAutoConversionPaused) {
      setManualConversionContext({ from: previousCurrency, to: selectedCurrencyKey });
      return;
    }
    const convertedValue = convertCurrencyValue(
      numericRate,
      previousCurrency as SupportedCurrency,
      selectedCurrencyKey as SupportedCurrency,
    );
    setAnswers((prev) => ({ ...prev, hourly_rate: convertedValue }));
    setManualConversionContext(null);
    setIsRateAutoConversionPaused(false);
  }, [
    convertCurrencyValue,
    isRateAutoConversionPaused,
    selectedCurrencyKey,
    setAnswers,
  ]);

  const convertHourlyRateManually = useCallback(() => {
    if (!manualConversionContext || !currencyRates) {
      return;
    }
    const currentValue = answersRef.current["hourly_rate"];
    const numericRate =
      typeof currentValue === "number" && !Number.isNaN(currentValue) ? currentValue : null;
    if (!numericRate) {
      return;
    }
    const convertedValue = convertCurrencyValue(
      numericRate,
      manualConversionContext.from as SupportedCurrency,
      manualConversionContext.to as SupportedCurrency,
    );
    setAnswers((prev) => ({ ...prev, hourly_rate: convertedValue }));
    setManualConversionContext(null);
    setIsRateAutoConversionPaused(false);
  }, [convertCurrencyValue, currencyRates, manualConversionContext, setAnswers]);

  const handleResumeAutoConversion = useCallback(() => {
    setIsRateAutoConversionPaused(false);
    setManualConversionContext(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);
    const incomingSession = sessionId ?? projectId ?? null;

    const hydrateWithDefaults = () => {
      setAnswers({});
      setSkippedQuestions({});
      setShowAdvancedSections({});
      setTouchedQuestions({});
      setProjectTitle("");
    };

    if (!stored) {
      hydrateWithDefaults();
      setActiveSessionId(incomingSession);
      setIsLocalHydrated(true);
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

      const storedAnswers = parsed.answers ?? {};
      const storedTouched =
        parsed.touched ?? deriveTouchedFromAnswers(storedAnswers);
      setAnswers(storedAnswers);
      setSkippedQuestions(parsed.skipped ?? {});
      setShowAdvancedSections(parsed.showAdvanced ?? {});
      setTouchedQuestions(storedTouched);
      if (!entry && parsed.entry) {
        setSelectedEntry(parsed.entry);
      }
      if (!userType && parsed.userType) {
        setSelectedUserType(parsed.userType);
      }
      setActiveSessionId(storedSession ?? incomingSession);
      if (!projectId && parsed.projectId) {
        setActiveProjectId(parsed.projectId);
      }
      if (parsed.projectTitle) {
        setProjectTitle(parsed.projectTitle);
      }
    } catch (error) {
      console.warn("Failed to parse questionnaire state", error);
      hydrateWithDefaults();
      setActiveSessionId(incomingSession);
    } finally {
      setIsLocalHydrated(true);
    }
  }, [entry, userType, sessionId, projectId]);

  useEffect(() => {
    if (!projectId) {
      setProjectLoadError(null);
      setIsProjectHydrated(true);
      return;
    }

    let cancelled = false;
    setProjectLoadError(null);
    setProjectSyncMessage(null);
    setProjectSyncError(null);
    setIsProjectHydrated(false);

    fetchProjectDetail(projectId)
      .then((detail) => {
        if (cancelled) return;
        applyProjectDetail(detail);
      })
      .catch((error) => {
        if (cancelled) return;
        setProjectLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load this saved project.",
        );
        setActiveProjectId(null);
      })
      .finally(() => {
        if (!cancelled) {
          setIsProjectHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, fetchProjectDetail, applyProjectDetail]);

  useEffect(() => {
    setDismissedSuggestions({});
  }, [analysis?.id]);

  useEffect(() => {
    if (selectedUserType !== "agency") return;
    if (!agencySummary?.recommendedBillableRate) return;
    if (hasTouchedHourlyRate) return;
    setAnswers((prev) => {
      const recommended = Math.round(agencySummary.recommendedBillableRate);
      const currentValue = prev["hourly_rate"];
      if (typeof currentValue === "number" && currentValue === recommended) {
        return prev;
      }
      return { ...prev, ["hourly_rate"]: recommended };
    });
  }, [
    selectedUserType,
    agencySummary?.recommendedBillableRate,
    hasTouchedHourlyRate,
  ]);

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
    if (!selectedUserType) return;
    const defaults = buildDefaultAnswers(questionnaireSections, selectedUserType);
    const personaDefaultIds = new Set<string>();
    questionnaireSections.forEach((section) => {
      section.questions.forEach((question) => {
        if (
          question.defaultsByUserType &&
          question.defaultsByUserType[selectedUserType] !== undefined
        ) {
          personaDefaultIds.add(question.id);
        }
      });
    });
    const personaPrefills: Record<string, QuestionnaireUserType> = {};
    setAnswers((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.entries(defaults).forEach(([questionId, defaultValue]) => {
        if (!hasMeaningfulAnswer(next[questionId])) {
          next[questionId] = defaultValue;
          if (personaDefaultIds.has(questionId)) {
            personaPrefills[questionId] = selectedUserType;
          }
          changed = true;
        }
      });
      if (!changed) {
        return prev;
      }
      if (Object.keys(personaPrefills).length > 0) {
        setPrefilledByPersona((prevPrefills) => ({
          ...prevPrefills,
          ...personaPrefills,
        }));
      }
      return next;
    });
  }, [selectedUserType]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const context = readUserContext();
    if (!entry && !selectedEntry && context?.entry) {
      setSelectedEntry(context.entry);
    }
    if (!userType && !selectedUserType && context?.userType) {
      setSelectedUserType(context.userType);
    }
    if (!sessionId && !activeSessionId && context?.sessionId) {
      setActiveSessionId(context.sessionId);
    }
  }, [entry, userType, sessionId, selectedEntry, selectedUserType, activeSessionId]);

  useEffect(() => {
    if (!isRestored || typeof window === "undefined") return;
    const payload: StoredQuestionnaireState = {
      answers,
      skipped: skippedQuestions,
      showAdvanced: showAdvancedSections,
      entry: selectedEntry,
      userType: selectedUserType,
      sessionId: activeSessionId,
      projectId: activeProjectId,
      projectTitle,
      touched: touchedQuestions,
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
    activeProjectId,
    projectTitle,
    touchedQuestions,
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
        projectId: activeProjectId,
        projectTitle,
        touched: touchedQuestions,
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
    activeProjectId,
    projectTitle,
    touchedQuestions,
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
      (q) =>
        q.required !== false &&
        touchedQuestions[q.id] &&
        isQuestionAnswered(q, answers[q.id]),
      );
      return count + answered.length;
    }, 0);
}, [answers, sectionStates, touchedQuestions]);

  const overallProgress =
    totalRequiredQuestions === 0
      ? 1
      : totalCompletedRequired / totalRequiredQuestions;
  const canCalculate = overallProgress >= 1 && !isCalculating;
  const canSyncProject = isRestored && !isProjectSaving;
  const personaContextCopy = getPersonaContextCopy(selectedUserType);
  const personaShortcut = getPersonaShortcut(selectedUserType);
  const personaShortcutHref = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedEntry) {
      params.set("entry", selectedEntry);
    }
    if (selectedUserType) {
      params.set("userType", selectedUserType);
    }
    if (activeSessionId) {
      params.set("session", activeSessionId);
    }
    const query = params.toString();
    return query ? `/onboarding?${query}` : "/onboarding";
  }, [activeSessionId, selectedEntry, selectedUserType]);
  const personaInsightCards = useMemo<InsightCardContent[]>(() => {
    return buildPersonaInsights({
      userType: selectedUserType,
      hourlyRate: formattedHourlyRate,
      currencySymbol: selectedCurrencyDisplay.symbol,
      agencySummary,
    });
  }, [agencySummary, formattedHourlyRate, selectedCurrencyDisplay.symbol, selectedUserType]);
  const shouldShowAgencySummary = selectedUserType === "agency" && agencySummary;

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSkippedQuestions((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    markTouched(questionId);
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
    markTouched(questionId);
  };

  const handleScaleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (questionId === "hourly_rate") {
      setIsRateAutoConversionPaused(true);
      setManualConversionContext(null);
    }
    markTouched(questionId);
  };

  const handleToggle = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    markTouched(questionId);
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    markTouched(questionId);
  };

  const handleSkipQuestion = (questionId: string, skip = true) => {
    clearPersonaPrefill(questionId);
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
    setTouchedQuestions((prev) => {
      const updated = { ...prev };
      const section = questionnaireSections.find((s) => s.id === sectionId);
      section?.questions.forEach((question) => {
        delete updated[question.id];
      });
      return updated;
    });
    setPrefilledByPersona((prev) => {
      const updated = { ...prev };
      const section = questionnaireSections.find((s) => s.id === sectionId);
      section?.questions.forEach((question) => {
        delete updated[question.id];
      });
      return updated;
    });
  };

  const handleReset = () => {
    setAnswers({});
    setSkippedQuestions({});
    setShowAdvancedSections({});
    setTouchedQuestions({});
    setActiveSectionIndex(0);
    setActiveProjectId(null);
    setProjectTitle("");
    setProjectSyncMessage(null);
    setProjectSyncError(null);
    setIsRateAutoConversionPaused(false);
    setManualConversionContext(null);
    previousCurrencyRef.current = "usd";
    setPrefilledByPersona({});
  };

  const handleCalculate = async () => {
    if (!canCalculate || isCalculating) return;
    setIsCalculating(true);
    setCalculationError(null);
    try {
      const calculationOptions: Parameters<typeof buildCalculationPayload>[0] = {
        answers,
        entry: selectedEntry,
        userType: selectedUserType,
      };
      if (selectedUserType === "agency" && agencySummary) {
        calculationOptions.agencySummary = agencySummary;
      }
      const { input, metadata } = buildCalculationPayload(calculationOptions);
      const calculationPayload = {
        ...input,
        currency: metadata.currency,
      };
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculationPayload),
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

  const buildProjectPayload = (): ProjectRequestPayload => {
    const normalizedTitle =
      projectTitle.trim().length > 0 ? projectTitle.trim() : "Untitled Project";
    const hourlyValue = answers["hourly_rate"];
    const hourlyRate =
      typeof hourlyValue === "number" && !Number.isNaN(hourlyValue)
        ? hourlyValue
        : null;
    const rawCurrency = answers["rate_currency"];
    const currency = SUPPORTED_CURRENCIES.includes(rawCurrency as SupportedCurrency)
      ? (rawCurrency as ProjectRequestPayload["currency"])
      : "usd";

    const payload: ProjectRequestPayload = {
      title: normalizedTitle,
      status: "draft",
      flow: selectedEntry ?? "fresh",
      persona: selectedUserType ?? null,
      hourlyRate,
      currency,
      answers,
    };
    return payload;
  };

  const updateProjectQueryParams = useCallback(
    (nextProjectId: string) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      params.set("projectId", nextProjectId);
      params.set("session", nextProjectId);
      if (selectedEntry) {
        params.set("entry", selectedEntry);
      }
      if (selectedUserType) {
        params.set("userType", selectedUserType);
      }
      router.replace(`/questionnaire?${params.toString()}`, { scroll: false });
    },
    [router, selectedEntry, selectedUserType],
  );

  const handleProjectSync = async () => {
    setProjectSyncMessage(null);
    setProjectSyncError(null);
    setIsProjectSaving(true);
    const payload = buildProjectPayload();
    const isUpdate = Boolean(activeProjectId);
    try {
      const detail = isUpdate && activeProjectId
        ? await updateProject(activeProjectId, payload)
        : await createProject(payload);
      applyProjectDetail(detail);
      updateProjectQueryParams(detail.id);
      setProjectSyncMessage(
        isUpdate ? "Project updated in workspace." : "Project saved to workspace.",
      );
    } catch (error) {
      setProjectSyncError(
        error instanceof Error ? error.message : "Unable to sync project.",
      );
    } finally {
      setIsProjectSaving(false);
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
    markTouched(suggestion.questionId);
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
  const SectionIcon = activeSectionState.section.icon;
  const isTimelineSection = activeSectionState.section.id === "timeline";
  const timelineQuestionIds = new Set(["hourly_rate", "rate_currency"]);
  const timelineHourlyQuestion = isTimelineSection
    ? displayedQuestions.find((question) => question.id === "hourly_rate")
    : undefined;
  const timelineCurrencyQuestion = isTimelineSection
    ? displayedQuestions.find((question) => question.id === "rate_currency")
    : undefined;
  const questionsToRender = isTimelineSection
    ? displayedQuestions.filter((question) => !timelineQuestionIds.has(question.id))
    : displayedQuestions;
  const showAgencyTeamNudge = isTimelineSection && selectedUserType === "agency";
  const shouldShowTimelineEconomicsCard =
    isTimelineSection &&
    (timelineHourlyQuestion || timelineCurrencyQuestion || showAgencyTeamNudge);

  const buildQuestionCardProps = (question: QuestionDefinition) => {
    const decoratedQuestion =
      question.id === "rate_currency" ? { ...question, helper: currencyHelperCopy } : question;
    return {
      question: decoratedQuestion,
      answer: answers[question.id],
      onSingleSelect: handleSingleSelect,
      onMultiSelect: handleMultiSelect,
      onScaleChange: handleScaleChange,
      onToggle: handleToggle,
      onTextChange: handleTextChange,
      onSkip: handleSkipQuestion,
      skipped: skippedQuestions[question.id],
      suggestion: suggestionMap[question.id],
      onAcceptSuggestion: handleApplySuggestion,
      onDismissSuggestion: handleDismissSuggestion,
      touched: Boolean(touchedQuestions[question.id]),
      persona: selectedUserType,
      personaPrefill: prefilledByPersona[question.id] ?? null,
    };
  };

  const renderQuestionCard = (question: QuestionDefinition) => (
    <QuestionCard key={question.id} {...buildQuestionCardProps(question)} />
  );

  return (
    <div className="space-y-8">
      <Card
        id="questionnaire-progress-card"
        className="border-conv-border bg-white shadow-card"
      >
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">
                  Project context
                </p>
                <p className="text-base text-conv-text-secondary">
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
                {personaContextCopy && (
                  <p className="mt-1 text-sm text-conv-primary">
                    {personaContextCopy}
                  </p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ContextChipGroup
                  label="Entry flow"
                  options={ENTRY_FLOW_CHOICES}
                  value={selectedEntry}
                  onSelect={(value) => setSelectedEntry(value)}
                />
                <ContextChipGroup
                  label="User type"
                  options={USER_TYPE_CHOICES}
                  value={selectedUserType}
                  onSelect={(value) => setSelectedUserType(value)}
                />
              </div>
              {shouldShowAgencySummary && agencySummary ? (
                <AgencySummaryPill
                  summary={agencySummary}
                  onManageTeam={() => setAgencyConfiguratorOpen(true)}
                />
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-4 lg:max-w-sm">
              <div className="flex items-center gap-4">
                <div className="h-2 flex-1 rounded-full bg-conv-border">
                  <div
                    className="h-2 rounded-full bg-conv-primary transition-all"
                    style={{ width: `${Math.round(overallProgress * 100)}%` }}
                  />
                </div>
                <span className="text-sm text-conv-text-secondary">
                  {Math.round(overallProgress * 100)}% complete
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-conv-border sm:w-auto"
                  onClick={handleReset}
                >
                  Reset answers
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="justify-start text-muted-foreground sm:w-auto"
                >
                  <Link href={personaShortcutHref}>{personaShortcut.label}</Link>
                </Button>
              </div>
              {personaShortcut.description && (
                <p className="text-xs text-muted-foreground sm:text-right">
                  {personaShortcut.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 space-y-3 rounded-2xl border border-conv-border bg-conv-background-alt p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">
                  Workspace sync · Pro
                </p>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(event) => setProjectTitle(event.target.value)}
                  maxLength={140}
                  placeholder="Client name · scope nickname"
                  className="mt-2 w-full rounded-lg border border-conv-border bg-white px-4 py-3 text-sm text-conv-text-primary outline-none ring-conv-primary/40 transition focus:ring"
                  disabled={!isRestored}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeProjectId
                    ? `Synced as ${activeProjectId.slice(0, 8)}… — updates are instantly available on your Projects dashboard.`
                    : "Name this snapshot before saving it to the Projects dashboard."}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  className="w-full gap-2 sm:w-auto"
                  onClick={handleProjectSync}
                  disabled={!canSyncProject}
                >
                  {isProjectSaving ? (
                    <>
                      Syncing
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      {activeProjectId ? "Update project" : "Save to projects"}
                      <CloudUpload className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-conv-text-secondary hover:text-conv-text-primary sm:w-auto"
                  asChild
                >
                  <Link href="/projects">View projects</Link>
                </Button>
              </div>
            </div>
            {projectSyncMessage && (
              <p className="text-xs text-conv-success">{projectSyncMessage}</p>
            )}
            {projectSyncError && (
              <p className="text-xs text-conv-error">{projectSyncError}</p>
            )}
            {projectLoadError && (
              <div className="flex items-center gap-2 rounded-lg border border-conv-warning/40 bg-conv-warning/10 px-3 py-2 text-xs text-conv-warning">
                <TriangleAlert className="h-4 w-4" />
                {projectLoadError}
              </div>
            )}
          </div>
          <Stepper
            sections={sectionStates}
            activeIndex={activeSectionIndex}
            onSelect={setActiveSectionIndex}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-conv-border bg-white shadow-card">
          <CardHeader className="flex flex-col gap-4 border-b border-conv-border pb-6">
            <div className="flex items-center gap-3">
              <SectionIcon className="h-5 w-5 text-conv-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">
                  {activeSectionState.section.badge}
                </p>
                <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-conv-text-primary md:text-3xl">
                  {activeSectionState.section.title}
                </h2>
              </div>
            </div>
            <p className="text-sm text-conv-text-secondary">
              {activeSectionState.section.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-conv-text-muted">
              <span>
                {Math.round(activeSectionState.completionRatio * 100)}% of base questions answered
              </span>
              <span className="h-1 rounded-full bg-conv-border px-1" />
              <button
                type="button"
                className="inline-flex items-center gap-1 text-conv-primary hover:underline"
                onClick={() => handleClearSection(activeSectionState.section.id)}
              >
                Clear section
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {shouldShowTimelineEconomicsCard ? (
              <div className="rounded-2xl border border-conv-border bg-conv-background-alt p-5">
                <div className="grid gap-6 lg:grid-cols-2">
                  {timelineHourlyQuestion && (
                    <QuestionCard
                      key={timelineHourlyQuestion.id}
                      {...buildQuestionCardProps(timelineHourlyQuestion)}
                      className="rounded-none border-none bg-transparent p-0 shadow-none"
                    />
                  )}
                  {timelineCurrencyQuestion && (
                    <QuestionCard
                      key={timelineCurrencyQuestion.id}
                      {...buildQuestionCardProps(timelineCurrencyQuestion)}
                      className="rounded-none border-none bg-transparent p-0 shadow-none"
                    />
                  )}
                </div>
                {(currencyRates ||
                  currencyError ||
                  isCurrencyLoadingRates ||
                  manualConversionContext ||
                  showAgencyTeamNudge) && (
                  <div className="mt-4 rounded-xl border border-conv-border bg-white p-4 text-xs text-conv-text-muted">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-conv-text-primary">Live FX status</span>
                      {isCurrencyLoadingRates && <span>Refreshing…</span>}
                      {!isCurrencyLoadingRates && currencyRates && (
                        <span>
                          {currencyRates.stale ? "Cached" : "Live"} ·{" "}
                          {formatFxRelativeTime(currencyRates) ?? "auto-synced"}
                        </span>
                      )}
                      {currencyError && (
                        <span className="text-conv-warning">{currencyError}</span>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-conv-text-secondary hover:text-conv-text-primary"
                        onClick={refreshCurrencyRates}
                      >
                        Refresh rates
                      </Button>
                    </div>
                    {manualConversionContext && (
                      <div className="mt-3 rounded-lg border border-conv-border-light bg-conv-background-alt p-3 text-xs text-conv-text-muted">
                        <p className="text-sm text-conv-text-primary">
                          {formattedHourlyRate !== null
                            ? `Hourly rate left at ${formattedHourlyRate.toFixed(0)} ${manualConversionContext.from.toUpperCase()} after your last override.`
                            : `Hourly rate left in ${manualConversionContext.from.toUpperCase()} after your last override.`}{" "}
                          Convert it to {manualConversionContext.to.toUpperCase()}?
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" onClick={convertHourlyRateManually}>
                            Convert now
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleResumeAutoConversion}>
                            Resume auto convert
                          </Button>
                        </div>
                      </div>
                    )}
                    {showAgencyTeamNudge && (
                      <div className="mt-3 rounded-lg border border-conv-primary/30 bg-conv-primary/5 p-4 text-sm">
                        <p className="text-conv-text-primary">
                          Team bandwidth drives your billable rate. Keep the roster updated before finalizing hours.
                        </p>
                        <Button
                          size="sm"
                          className="mt-3 w-full sm:w-auto"
                          variant="outline"
                          onClick={() => setAgencyConfiguratorOpen(true)}
                        >
                          Open team configurator
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {questionsToRender.length === 0 && !shouldShowTimelineEconomicsCard ? (
              <div className="rounded-xl border border-dashed border-conv-border p-6 text-sm text-conv-text-secondary">
                No questions to show yet. Adjust previous answers or reveal advanced prompts.
              </div>
            ) : (
              questionsToRender.map((question) => renderQuestionCard(question))
            )}

            {hasAdvancedQuestions && !showAdvancedSections[activeSectionState.section.id] && (
              <div className="rounded-xl border border-conv-border bg-conv-background-alt p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-conv-text-primary">
                      Advanced questions available
                    </p>
                    <p className="text-xs text-conv-text-muted">
                      Tackle complex requirements now or skip—they're optional.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-conv-border"
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
                            delete updated[id];
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
          <CardFooter className="flex flex-col gap-3 border-t border-conv-border pt-6">
            <div className="flex flex-col gap-2 text-sm text-conv-text-secondary sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant="ghost"
                className="w-full gap-2 text-conv-text-secondary sm:w-auto"
                onClick={() =>
                  setActiveSectionIndex((index) => Math.max(0, index - 1))
                }
                disabled={activeSectionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant={isLastSection ? "default" : "secondary"}
                className="w-full gap-2 sm:w-auto"
                disabled={isLastSection ? !canCalculate : false}
                onClick={() => {
                  if (isLastSection) {
                    if (!canCalculate) return;
                    void handleCalculate();
                    return;
                  }
                  setActiveSectionIndex((index) =>
                    Math.min(sectionStates.length - 1, index + 1),
                  );
                }}
              >
                {isLastSection ? (
                  <>
                    {isCalculating ? (
                      <>
                        Calculating…
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Calculate project cost
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Next section
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {isLastSection && calculationError && (
              <p className="w-full text-center text-sm text-destructive">
                {calculationError}
              </p>
            )}
          </CardFooter>
        </Card>

        <aside className="space-y-4">
          <InsightCard kicker="Auto-save" title="Progress saved every 30 seconds" icon={CloudDownload}>
            <p>Feel free to close the tab—your answers stay synced locally.</p>
          </InsightCard>

          {personaInsightCards.map((card) => (
            <InsightCard
              key={card.kicker}
              kicker={card.kicker}
              title={card.title}
              icon={card.icon ?? Sparkles}
            >
              {card.body}
            </InsightCard>
          ))}

          <InsightCard kicker="Checklist" title="What's left?" icon={ClipboardList}>
            <ul className="space-y-2 text-sm text-conv-text-secondary">
              {sectionStates.map((state) => (
                <li key={state.section.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-conv-primary" />
                  <div>
                    <p className="text-conv-text-primary">{state.section.title}</p>
                    <p className="text-xs text-conv-text-muted">
                      {Math.round(state.completionRatio * 100)}% base coverage
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </InsightCard>
        </aside>
      </div>

      {shouldShowAgencySummary && agencySummary && (
        <AgencyConfiguratorOverlay
          open={isAgencyConfiguratorOpen}
          onClose={() => setAgencyConfiguratorOpen(false)}
        >
          <AgencyTeamConfigurator
            state={agencyTeamState}
            summary={agencySummary}
            onUpsert={upsertMember}
            onRemove={removeMember}
            onReset={resetAgencyTeam}
            onSettingsChange={updateAgencySettings}
            variant="embedded"
            currencySymbol={selectedCurrencyDisplay.symbol}
          />
        </AgencyConfiguratorOverlay>
      )}
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
              "rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conv-primary",
              isActive
                ? "border-conv-primary bg-conv-primary/10"
                : "border-conv-border bg-white hover:border-conv-primary/30",
            )}
          >
            <div className="flex items-center justify-between text-xs text-conv-text-muted">
              <span>{index + 1}</span>
              {state.completionRatio === 1 && (
                <Check className="h-4 w-4 text-conv-primary" />
              )}
            </div>
            <p className="mt-2 text-sm font-semibold text-conv-text-primary">
              {state.section.title}
            </p>
            <p className="text-xs text-conv-text-muted">
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
  touched,
  className,
  persona,
  personaPrefill,
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
  touched: boolean;
  className?: string;
  persona?: QuestionnaireUserType | null;
  personaPrefill?: QuestionnaireUserType | null;
  onSingleSelect: (id: string, value: string) => void;
  onMultiSelect: (id: string, value: string) => void;
  onScaleChange: (id: string, value: number) => void;
  onToggle: (id: string, value: boolean) => void;
  onTextChange: (id: string, value: string) => void;
  onSkip: (id: string, skip?: boolean) => void;
  onAcceptSuggestion?: (suggestion: CrawlSuggestion) => void;
  onDismissSuggestion?: (questionId: string) => void;
}) {
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const isAnswered = touched && !skipped && isQuestionAnswered(question, answer);
  const formattedSuggestionLabel = suggestion
    ? formatAiSuggestionText(suggestion.valueLabel)
    : null;
  const formattedSuggestionRationale = suggestion
    ? formatAiSuggestionText(suggestion.rationale)
    : null;
  const suggestionApplied =
    suggestion && touched && answersEqual(answer, suggestion.value);
  const showSuggestion = Boolean(suggestion && !skipped && !suggestionApplied);
  const suggestionPending = showSuggestion && !touched;
  const isCollapseEligible =
    question.type !== "multi" && question.type !== "scale";
  const shouldAutoCollapse = isCollapseEligible && isAnswered && !suggestionPending;
  const isCollapsed = shouldAutoCollapse && !isManuallyExpanded;
  const answerSummary = useMemo(
    () => summarizeAnswer(question, answer),
    [question, answer],
  );
  const containerClasses = cn(
    "rounded-2xl border bg-white p-5 transition-shadow duration-300 shadow-card",
    suggestionPending
      ? "border-conv-primary bg-conv-primary/5 shadow-[0_0_25px_rgba(58,139,140,0.15)]"
      : "border-conv-border",
    className,
  );

  if (isCollapsed) {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">Answered</p>
            <p className="font-serif text-lg font-normal leading-tight tracking-tight text-conv-text-primary">{question.title}</p>
            {answerSummary && (
              <p className="text-sm text-conv-text-secondary">{answerSummary}</p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-conv-border"
            onClick={() => setIsManuallyExpanded(true)}
          >
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-serif text-lg font-normal leading-tight tracking-tight text-conv-text-primary">
              {question.title}
            </p>
            {question.tooltip && (
              <Tooltip label={question.tooltip} />
            )}
            {question.advanced && (
              <span className="rounded-full border border-conv-border px-2 py-0.5 text-xs text-conv-text-muted">
                Advanced
              </span>
            )}
          </div>
          {question.description && (
            <p className="text-sm text-conv-text-secondary">
              {question.description}
            </p>
          )}
          {question.helper && (
            <p className="text-xs text-conv-text-muted">
              {question.helper}
            </p>
          )}
          {personaPrefill && (
            <p className="text-xs text-conv-primary">
              Prefilled from your {formatPersonaLabel(personaPrefill)} profile
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {shouldAutoCollapse && (
            <button
              type="button"
              className="text-xs text-conv-text-muted hover:text-conv-text-primary"
              onClick={() => setIsManuallyExpanded(false)}
            >
              Collapse
            </button>
          )}
          {question.advanced && (
            <button
              type="button"
              className="text-xs text-conv-text-muted hover:text-conv-text-primary"
              onClick={() => onSkip(question.id, true)}
            >
              Skip question
            </button>
          )}
        </div>
      </div>
      {showSuggestion && suggestion && (
        <div className="mb-3">
          <div
            tabIndex={0}
            className="group relative inline-flex cursor-pointer items-center gap-2 rounded-full border border-conv-primary/40 bg-conv-primary/10 px-3 py-1 text-[11px] text-conv-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-conv-primary/60"
          >
            <Sparkles className="h-3 w-3" />
            AI suggestion
            <div className="pointer-events-none absolute left-0 top-full z-20 hidden w-72 rounded-2xl border border-conv-border bg-white p-4 text-left text-xs text-conv-text-muted shadow-card-elevated group-hover:pointer-events-auto group-hover:block group-focus-visible:pointer-events-auto group-focus-visible:block">
              <p className="text-sm font-semibold text-conv-text-primary">
                {formattedSuggestionLabel ?? suggestion.valueLabel}
              </p>
              {formattedSuggestionRationale && (
                <p className="mt-1 text-[11px] text-conv-text-muted">
                  {formattedSuggestionRationale}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="h-8 gap-1 bg-conv-primary text-xs text-white"
                  onClick={() => onAcceptSuggestion?.(suggestion)}
                >
                  Accept
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-conv-text-secondary"
                  onClick={() => onDismissSuggestion?.(question.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {skipped && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-conv-border px-3 py-2 text-xs text-conv-text-muted">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-conv-primary" />
            Skipped for now — revisit any time.
          </div>
          <button
            type="button"
            className="text-xs text-conv-primary hover:underline"
            onClick={() => onSkip(question.id, false)}
          >
            Resume
          </button>
        </div>
      )}
      {!skipped && (
        <div className="mt-4">
          {renderByType(question, answer, touched, persona ?? null, {
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

function deriveTouchedFromAnswers(answers: QuestionnaireAnswerMap) {
  const touched: Record<string, boolean> = {};
  Object.entries(answers).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      return;
    }
    touched[key] = true;
  });
  return touched;
}

function hasMeaningfulAnswer(value: QuestionnaireAnswer): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

function renderByType(
  question: QuestionDefinition,
  answer: QuestionnaireAnswer,
  touched: boolean,
  persona: QuestionnaireUserType | null,
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
        <div
          className={cn(
            "grid gap-3",
            question.id === "rate_currency" ? "sm:grid-cols-3" : "md:grid-cols-2",
          )}
        >
          {prioritizeOptions(question.options ?? [], persona).map((option) => {
            const currentAnswer = touched ? answer : undefined;
            const isSelected = currentAnswer === option.value;
            const isCurrencyQuestion = question.id === "rate_currency";
            const currencyDisplay =
              isCurrencyQuestion && typeof option.value === "string" && isCurrencyDisplayKey(option.value)
                ? CURRENCY_DISPLAY[option.value]
                : undefined;
            const buttonAriaLabel = isCurrencyQuestion ? option.label : undefined;
            const isRecommended = Boolean(
              persona && option.recommendedFor?.includes(persona),
            );
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlers.onSingleSelect(question.id, option.value)}
                aria-label={buttonAriaLabel}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  isSelected
                    ? "border-conv-primary bg-conv-primary/10"
                    : "border-conv-border hover:border-conv-primary/30",
                )}
              >
                {currencyDisplay ? (
                  <div className="flex items-center justify-center">
                    <span className="text-xl font-semibold text-conv-text-primary">
                      {currencyDisplay.symbol}
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-conv-text-primary">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-conv-text-secondary">{option.description}</p>
                    )}
                  </>
                )}
                {option.badge && (
                  <span className="mt-2 inline-block rounded-full border border-conv-border px-2 py-0.5 text-[10px] text-conv-text-muted">
                    {option.badge}
                  </span>
                )}
                {isRecommended && (
                  <span className="mt-2 inline-flex items-center rounded-full border border-conv-primary/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-conv-primary">
                    Recommended
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
          {prioritizeOptions(question.options ?? [], persona).map((option) => {
            const selections =
              touched && Array.isArray(answer) ? (answer as string[]) : [];
            const isSelected = selections.includes(option.value);
            const isRecommended = Boolean(
              persona && option.recommendedFor?.includes(persona),
            );
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handlers.onMultiSelect(question.id, option.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  isSelected
                    ? "border-conv-primary bg-conv-primary/10 text-conv-text-primary"
                    : "border-conv-border text-conv-text-secondary hover:border-conv-primary/40 hover:text-conv-text-primary",
                )}
              >
                <span>{option.label}</span>
                {isRecommended && (
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-conv-primary">
                    Recommended
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    case "scale":
      {
        const displayValue =
          touched && typeof answer === "number"
            ? (answer as number)
            : question.min ?? 0;
      return (
        <div>
          <div className="flex items-center justify-between text-xs text-conv-text-muted">
            <span>{question.min}</span>
            <span>{question.max}</span>
          </div>
          <input
            type="range"
            min={question.min}
            max={question.max}
            step={question.step ?? 1}
              value={displayValue}
            onChange={(event) =>
              handlers.onScaleChange(question.id, Number(event.target.value))
            }
            className="mt-2 w-full accent-conv-primary"
          />
          <div className="mt-1 text-sm text-conv-text-primary">
              {displayValue}
          </div>
        </div>
      );
      }
    case "toggle":
      {
        const currentValue = touched ? Boolean(answer) : false;
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
              onClick={() => handlers.onToggle(question.id, !currentValue)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full border border-conv-border transition",
                currentValue ? "bg-conv-primary" : "bg-conv-background-alt",
            )}
            role="switch"
              aria-checked={currentValue}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white shadow transition",
                  currentValue ? "translate-x-5" : "translate-x-1",
              )}
            />
          </button>
          <span className="text-sm text-conv-text-secondary">
              {currentValue ? "Enabled" : "Disabled"}
          </span>
        </div>
      );
      }
    case "text":
      return (
        <textarea
          value={touched && typeof answer === "string" ? answer : ""}
          onChange={(event) => handlers.onTextChange(question.id, event.target.value)}
          placeholder={question.placeholder}
          className="w-full rounded-xl border border-conv-border bg-white px-4 py-3 text-sm text-conv-text-primary outline-none ring-conv-primary/40 focus:ring"
          rows={4}
        />
      );
    default:
      return null;
  }
}

function ContextChipGroup<TValue extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { id: TValue; label: string }[];
  value: TValue | null;
  onSelect: (value: TValue) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-wide text-conv-text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              value === option.id
                ? "border-conv-primary bg-conv-primary/10 text-conv-text-primary"
                : "border-conv-border text-conv-text-secondary hover:border-conv-primary/40 hover:text-conv-text-primary",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgencySummaryPill({
  summary,
  onManageTeam,
}: {
  summary: AgencyRateSummary;
  onManageTeam: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-conv-border bg-conv-background-alt p-4 shadow-card md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">
          Team capacity
        </p>
        <p className="text-sm text-conv-text-secondary">
          {summary.memberCount} members · {summary.totalWeeklyCapacity} hrs/week
        </p>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-conv-text-muted">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-conv-primary" />
          {Math.round(summary.margin * 100)}% margin target
        </span>
        <span className="inline-flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-conv-primary" />
          Recommended {summary.recommendedBillableRate.toFixed(0)} / hr
        </span>
      </div>
      <Button size="sm" variant="outline" className="border-conv-border" onClick={onManageTeam}>
        Manage team
      </Button>
    </div>
  );
}

function AgencyConfiguratorOverlay({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-5xl rounded-3xl border border-conv-border bg-white p-6 shadow-card-elevated">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close team configurator"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-conv-border text-conv-text-secondary hover:text-conv-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function buildPersonaInsights({
  userType,
  hourlyRate,
  currencySymbol,
  agencySummary,
}: {
  userType: QuestionnaireUserType | null;
  hourlyRate: number | null;
  currencySymbol: string;
  agencySummary?: AgencyRateSummary;
}): InsightCardContent[] {
  if (!userType) return [];
  switch (userType) {
    case "freelancer":
      return [
        {
          kicker: "Hourly guardrail",
          title: hourlyRate
            ? `Charging ${currencySymbol}${hourlyRate.toFixed(0)}/hr`
            : "Protect your hourly floor",
          icon: DollarSign,
          body: (
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Lock rush/maintenance multipliers before sharing estimates.</li>
              <li>Use the proposal shell CTA to export a ready-to-send outline.</li>
            </ul>
          ),
        },
      ];
    case "agency":
      return [
        {
          kicker: "Team sync",
          title: "Keep templates + capacity aligned",
          icon: Users,
          body: (
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                {agencySummary
                  ? `Recommended blended rate ${currencySymbol}${agencySummary.recommendedBillableRate.toFixed(0)} / hr`
                  : "Set your blended rate so templates stay accurate."}
              </li>
              <li>Update the team configurator before calculating final costs.</li>
            </ul>
          ),
        },
      ];
    case "company":
      return [
        {
          kicker: "Stakeholder prep",
          title: "Keep procurement unblocked",
          icon: Shield,
          body: (
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Tag the approval count + procurement steps in the timeline section.</li>
              <li>Use the vendor brief CTA to share a read-only scope snapshot.</li>
            </ul>
          ),
        },
      ];
    default:
      return [];
  }
}

function getPersonaContextCopy(userType: QuestionnaireUserType | null): string | null {
  if (!userType) return null;
  switch (userType) {
    case "freelancer":
      return "Solo builder mode · keep cashflow and upsells front and center.";
    case "agency":
      return "Agency mode · protect margin with shared templates and capacity.";
    case "company":
      return "Company mode · align budgets and stakeholders as you scope.";
    default:
      return null;
  }
}

function getPersonaShortcut(userType: QuestionnaireUserType | null): {
  label: string;
  description?: string;
} {
  switch (userType) {
    case "freelancer":
      return {
        label: "Generate proposal shell",
        description: "Jump back to onboarding whenever you need a proposal-ready outline.",
      };
    case "agency":
      return {
        label: "Sync team template",
        description: "Head to onboarding to refresh shared templates or margins.",
      };
    case "company":
      return {
        label: "Prepare vendor brief",
        description: "Update onboarding inputs before sharing with stakeholders.",
      };
    default:
      return {
        label: "Review onboarding",
        description: "Adjust your kickoff selections any time.",
      };
  }
}

function formatPersonaLabel(userType: QuestionnaireUserType): string {
  return userType.charAt(0).toUpperCase() + userType.slice(1);
}

function prioritizeOptions<TOption extends { recommendedFor?: QuestionnaireUserType[] }>(
  options: TOption[],
  persona: QuestionnaireUserType | null,
): TOption[] {
  if (!persona) {
    return options;
  }
  const recommended = options.filter((option) => option.recommendedFor?.includes(persona));
  const rest = options.filter((option) => !option.recommendedFor?.includes(persona));
  return [...recommended, ...rest];
}

function summarizeAnswer(
  question: QuestionDefinition,
  answer: QuestionnaireAnswer,
): string {
  if (answer === null || answer === undefined) {
    return "";
  }

  switch (question.type) {
    case "single": {
      const value = String(answer);
      const label = question.options?.find((option) => option.value === value)?.label;
      return label ?? value;
    }
    case "multi": {
      if (!Array.isArray(answer) || answer.length === 0) {
        return "";
      }
      const labels = answer
        .map((value) => {
          const label = question.options?.find((option) => option.value === value)?.label;
          return label ?? value;
        })
        .filter(Boolean);
      return labels.join(", ");
    }
    case "scale":
      return typeof answer === "number" ? answer.toString() : "";
    case "toggle":
      return Boolean(answer) ? "Enabled" : "Disabled";
    case "text":
      return typeof answer === "string" ? answer.slice(0, 120) : "";
    default:
      if (Array.isArray(answer)) {
        return answer.join(", ");
      }
      return String(answer);
  }
}

function formatAiSuggestionText(text?: string | null): string | null {
  if (!text) {
    return null;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  if (!hasLetters) {
    return trimmed;
  }
  const isAllCaps = trimmed === trimmed.toUpperCase();
  if (!isAllCaps) {
    return trimmed;
  }
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="relative group">
      <HelpCircle className="h-4 w-4 text-conv-text-muted group-hover:text-conv-primary" />
      <div className="pointer-events-none absolute left-1/2 top-full mt-2 hidden w-64 -translate-x-1/2 rounded-xl border border-conv-border bg-white p-3 text-xs text-conv-text-secondary shadow-card-elevated group-hover:block">
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
    <Card className="border-conv-border bg-white shadow-card">
      <CardHeader className="pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">{kicker}</p>
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