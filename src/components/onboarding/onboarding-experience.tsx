"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildFlowHref } from "@/lib/navigation";
import { saveUserContext } from "@/lib/user-context";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  Info,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

const steps = [
  { id: 0, label: "Entry flow" },
  { id: 1, label: "User type" },
  { id: 2, label: "Kickoff summary" },
] as const;

const entryOptions = [
  {
    id: "fresh",
    title: "Start a fresh Webflow build",
    tagline: "Greenfield flow",
    description:
      "Plan a net-new site with the full questionnaire. Ideal when nothing (or very little) exists yet.",
    icon: Sparkles,
    timeline: "3–8 weeks",
    effort: "Full discovery",
    bullets: [
      "Guided questionnaire across design, functionality, content, and technical needs",
      "Deterministic cost engine with urgency + maintenance multipliers",
      "Outputs include scope brief, cost table, and timeline view",
    ],
    summary: {
      headline: "Structure scope before layering AI",
      body: "We lead with deterministic questions, then invite AI enhancements once answers are saved.",
      checklist: [
        "Confirm core project type + target launch window",
        "Gather brand and system assets for upload",
      ],
      primaryCta: "Prep questionnaire",
    },
  },
  {
    id: "existing",
    title: "Analyze an existing website",
    tagline: "Migration flow",
    description:
      "Point the crawler at a current site, capture what stays, and map the migration effort into Webflow.",
    icon: Globe,
    timeline: "1–2 weeks",
    effort: "Crawler-assisted",
    bullets: [
      "Firecrawl snapshot for structure, assets, and tech stack",
      "Lightweight questionnaire focused on deltas and improvements",
      "Migration multipliers + risk flags baked into the output",
    ],
    summary: {
      headline: "Anchor estimate to real site data",
      body: "Combine crawl metrics with intent questions to quantify migration scope.",
      checklist: [
        "Verify crawl permissions + sitemap access",
        "Mark content to migrate vs rewrite",
      ],
      primaryCta: "Connect crawler",
    },
  },
] as const;

const userTypes = [
  {
    id: "freelancer",
    title: "Freelancer",
    description: "Solo builders needing fast, client-ready proposals.",
    icon: Briefcase,
    badges: ["Hourly rate guardrails", "Client-ready PDF"],
    tooltip:
      "Great when you need to protect margin as a team of one. We’ll nudge hourly ranges, upsells, and maintenance retainers.",
    focus: [
      "Benchmark hourly rate + rush multipliers",
      "Proposal-ready breakdown with watermark",
      "Maintenance retainer suggestions",
    ],
    summary: {
      headline: "Protect solo margins",
      body: "Surface hourly guidance and ready-to-send proposals.",
      checklist: [
        "Lock hourly + rush multipliers",
        "Enable proposal-ready breakdown",
      ],
      secondaryCta: "Generate proposal shell",
    },
  },
  {
    id: "agency",
    title: "Agency",
    description: "Standardize pricing across your team with shared templates.",
    icon: Users,
    badges: ["Team bandwidth", "Margin tracking"],
    tooltip:
      "Capture blended rates, team roles, and margin targets so every estimate lines up with agency economics.",
    focus: [
      "Team capacity + margin guardrails",
      "Internal vs client-facing rates",
      "Template library for repeat scopes",
    ],
    summary: {
      headline: "Keep margin intact at scale",
      body: "Bake in team capacity, markup, and shared scope templates.",
      checklist: [
        "Define margin targets + markup",
        "Sync team composition + blended rate",
      ],
      secondaryCta: "Sync team template",
    },
  },
  {
    id: "company",
    title: "Company",
    description:
      "Plan budgets and vendor briefs for internal stakeholders or RFPs.",
    icon: Building2,
    badges: ["Budget planning", "Stakeholder alignment"],
    tooltip:
      "Ideal for in-house teams or hiring managers. Capture internal capabilities, stakeholder count, and procurement needs.",
    focus: [
      "Budget range + internal capacity",
      "Stakeholder + approval tracking",
      "RFP/RFQ brief starter kit",
    ],
    summary: {
      headline: "Align budget + stakeholders",
      body: "Translate questionnaire answers into exec-ready briefs.",
      checklist: [
        "Document stakeholder approvals",
        "Attach internal capabilities snapshot",
      ],
      secondaryCta: "Export vendor brief",
    },
  },
] as const;

type EntryOptionId = (typeof entryOptions)[number]["id"];
type UserTypeId = (typeof userTypes)[number]["id"];

interface OnboardingExperienceProps {
  initialEntryParam?: string;
  initialUserTypeParam?: string;
}

export function OnboardingExperience({
  initialEntryParam,
  initialUserTypeParam,
}: OnboardingExperienceProps) {
  const initialEntry = parseEntry(initialEntryParam);
  const initialUserType = parseUserType(initialUserTypeParam);

  const [sessionId] = useState(() => generateSessionId());
  const [selectedEntry, setSelectedEntry] = useState<EntryOptionId | null>(
    initialEntry,
  );
  const [selectedUserType, setSelectedUserType] = useState<UserTypeId | null>(
    initialUserType,
  );

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (initialEntry && initialUserType) {
      return 2;
    }
    if (initialEntry) {
      return 1;
    }
    return 0;
  });

  const selectedEntryData = entryOptions.find(
    (option) => option.id === selectedEntry,
  );
  const selectedUserTypeData = userTypes.find(
    (type) => type.id === selectedUserType,
  );

  useEffect(() => {
    saveUserContext({
      entry: selectedEntry,
      userType: selectedUserType,
      sessionId,
    });
  }, [selectedEntry, selectedUserType, sessionId]);

  const combinedSummary = useMemo(() => {
    if (!selectedEntryData || !selectedUserTypeData) {
      return null;
    }

    const checklist = Array.from(
      new Set([
        ...selectedEntryData.summary.checklist,
        ...selectedUserTypeData.summary.checklist,
      ]),
    );

    return {
      headline: `${selectedEntryData.summary.headline} · ${selectedUserTypeData.summary.headline}`,
      description: `${selectedEntryData.summary.body} ${selectedUserTypeData.summary.body}`,
      checklist,
      primaryCta: selectedEntryData.summary.primaryCta,
      secondaryCta: selectedUserTypeData.summary.secondaryCta,
    };
  }, [selectedEntryData, selectedUserTypeData]);

  const canAdvance =
    (currentStep === 0 && !!selectedEntry) ||
    (currentStep === 1 && !!selectedUserType) ||
    currentStep === steps.length - 1;

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStep(0);
      return;
    }
    if (!canAdvance) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="border-white/5 bg-gradient-to-b from-[#0f1324] to-[#080a15]">
        <CardHeader>
          <p className="text-xs text-primary">
            Guided onboarding
          </p>
          <CardTitle className="text-2xl">
            Tell us how you’d like to kick things off.
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            We’ll remember your selections for the questionnaire, crawler,
            exports, and AI assists.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator currentStep={currentStep} />
          <div
            key={currentStep}
            className="animate-in fade-in-0 zoom-in-95 duration-300"
            aria-live="polite"
          >
            {renderStep({
              currentStep,
              selectedEntry,
              selectedUserType,
              onEntrySelect: setSelectedEntry,
              onUserTypeSelect: setSelectedUserType,
              summary: combinedSummary,
              entryData: selectedEntryData,
              userTypeData: selectedUserTypeData,
              sessionId,
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="w-full gap-2 text-muted-foreground sm:w-auto"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="w-full gap-2 sm:w-auto"
            onClick={handleNext}
            disabled={!canAdvance && !isLastStep}
          >
            {isLastStep ? "Restart flow" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <aside className="space-y-4">
        <InsightCard
          kicker="Flow focus"
          title={selectedEntryData?.title ?? "Choose an entry flow"}
        >
          {selectedEntryData ? (
            <InsightList
              icon={Layers}
              muted={`${selectedEntryData.timeline} · ${selectedEntryData.effort}`}
              items={selectedEntryData.bullets.slice(0, 2)}
            />
          ) : (
            <PlaceholderText>
              Pick whether you’re estimating a fresh build or migrating an
              existing site.
            </PlaceholderText>
          )}
        </InsightCard>

        <InsightCard
          kicker="User priorities"
          title={selectedUserTypeData?.title ?? "Choose a user type"}
        >
          {selectedUserTypeData ? (
            <InsightList
              icon={ClipboardCheck}
              muted={selectedUserTypeData.badges.join(" • ")}
              items={selectedUserTypeData.focus}
            />
          ) : (
            <PlaceholderText>
              Tell us if you’re a freelancer, agency, or company so we can
              tailor benchmarks.
            </PlaceholderText>
          )}
        </InsightCard>

        <InsightCard kicker="Readiness" title="Kickoff checklist">
          {combinedSummary ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {combinedSummary.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <PlaceholderText>
              Once both selections are made we’ll prep a checklist for you.
            </PlaceholderText>
          )}
        </InsightCard>
      </aside>
    </div>
  );
}

function renderStep({
  currentStep,
  selectedEntry,
  selectedUserType,
  onEntrySelect,
  onUserTypeSelect,
  summary,
  entryData,
  userTypeData,
  sessionId,
}: {
  currentStep: number;
  selectedEntry: EntryOptionId | null;
  selectedUserType: UserTypeId | null;
  onEntrySelect: (value: EntryOptionId) => void;
  onUserTypeSelect: (value: UserTypeId) => void;
  summary: {
    headline: string;
    description: string;
    checklist: string[];
    primaryCta: string;
    secondaryCta: string;
  } | null;
  entryData?: (typeof entryOptions)[number];
  userTypeData?: (typeof userTypes)[number];
  sessionId: string;
}) {
  if (currentStep === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {entryOptions.map((option) => (
          <EntryOptionCard
            key={option.id}
            option={option}
            selected={selectedEntry === option.id}
            onSelect={() => onEntrySelect(option.id)}
          />
        ))}
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userTypes.map((type) => (
          <UserTypeCard
            key={type.id}
            type={type}
            selected={selectedUserType === type.id}
            onSelect={() => onUserTypeSelect(type.id)}
          />
        ))}
      </div>
    );
  }

  if (currentStep === 2 && summary && entryData && userTypeData) {
    const questionnaireHref = buildFlowHref(
      "/questionnaire",
      selectedEntry,
      selectedUserType,
      { session: sessionId },
    );
    const primaryHref =
      selectedEntry === "existing"
        ? buildFlowHref("/analysis", selectedEntry, selectedUserType, {
            session: sessionId,
          })
        : questionnaireHref;
    const secondaryHref =
      selectedEntry === "existing"
        ? questionnaireHref
        : `${questionnaireHref}#advanced`;
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 shadow-soft-card">
          <p className="text-xs text-primary">
            You’re locked in
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {summary.headline}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {summary.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryTile
            title="Entry flow"
            meta={`${entryData.timeline} • ${entryData.effort}`}
            points={entryData.bullets}
          />
          <SummaryTile
            title="User type focus"
            meta={userTypeData.badges.join(" • ")}
            points={userTypeData.focus}
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h4 className="text-sm font-semibold text-primary">
            Kickoff checklist
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {summary.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" className="gap-2" asChild>
            <Link href={primaryHref}>
              {summary.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/20"
            asChild
          >
            <Link href={secondaryHref}>{summary.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
      Make a selection to see the next step.
    </div>
  );
}

function EntryOptionCard({
  option,
  selected,
  onSelect,
}: {
  option: (typeof entryOptions)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border bg-white/[0.02] p-5 text-left transition-all duration-300",
        selected
          ? "border-primary/70 shadow-[0_20px_40px_rgba(110,73,255,0.25)]"
          : "border-white/5 hover:border-white/20",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/5 p-2">
            <option.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-primary/70">
              {option.tagline}
            </p>
            <p className="text-lg font-semibold text-white">{option.title}</p>
          </div>
        </div>
        {selected ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{option.description}</p>
      <ul className="space-y-2 text-sm text-muted-foreground/90">
        {option.bullets.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
        <BadgePill label={`Timeline · ${option.timeline}`} />
        <BadgePill label={`Effort · ${option.effort}`} />
      </div>
    </button>
  );
}

function UserTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: (typeof userTypes)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const tooltipId = `${type.id}-tooltip`;

  const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex h-full flex-col gap-4 rounded-2xl border bg-white/[0.02] p-5 text-left transition-all duration-300",
        selected
          ? "border-primary/70 shadow-[0_20px_40px_rgba(110,73,255,0.25)]"
          : "border-white/5 hover:border-white/20",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/5 p-2">
            <type.icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{type.title}</p>
            <p className="text-xs text-primary/70">
              User profile
            </p>
          </div>
        </div>
        {selected ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : (
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{type.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
        {type.badges.map((badge) => (
          <BadgePill key={badge} label={badge} />
        ))}
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground/90">
        {type.focus.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-1 flex items-center text-xs">
        <div className="group/tooltip relative inline-flex">
          <button
            type="button"
            aria-describedby={tooltipId}
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-white focus-visible:text-white"
            onClick={handleInfoClick}
          >
            <Info className="h-3.5 w-3.5 text-primary" />
            Need context?{" "}
            <span className="underline decoration-dotted decoration-white/30 underline-offset-4">
              Learn more
            </span>
          </button>
          <div
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-20 hidden w-64 rounded-2xl border border-white/10 bg-background/95 p-3 text-left text-xs text-muted-foreground shadow-2xl group-hover/tooltip:flex group-focus-within/tooltip:flex"
          >
            {type.tooltip}
          </div>
        </div>
      </div>
    </button>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex items-center gap-3 text-left sm:flex-1 sm:text-center"
        >
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
              currentStep === index
                ? "border-primary text-primary"
                : currentStep > index
                  ? "border-primary/50 text-primary/70"
                  : "border-white/10 text-muted-foreground",
            )}
          >
            {index + 1}
          </div>
          <span className="text-xs text-muted-foreground">
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className="mx-4 hidden h-px flex-1 bg-gradient-to-r from-white/10 to-transparent sm:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

function InsightCard({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent">
      <CardHeader className="pb-3">
        <p className="text-xs text-primary/80">
          {kicker}
        </p>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm">{children}</CardContent>
    </Card>
  );
}

function InsightList({
  icon,
  muted,
  items,
}: {
  icon: LucideIcon;
  muted: string;
  items: string[];
}) {
  const Icon = icon;
  return (
    <div className="space-y-3 text-muted-foreground">
      <p className="flex items-center gap-2 text-xs text-muted-foreground/70">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {muted}
      </p>
      <ul className="space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1 w-1 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryTile({
  title,
  meta,
  points,
}: {
  title: string;
  meta: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
      <p className="text-xs text-primary">
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BadgePill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1">
      {label}
    </span>
  );
}

function PlaceholderText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function generateSessionId() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function parseEntry(value?: string): EntryOptionId | null {
  if (!value) return null;
  return entryOptions.some((option) => option.id === value)
    ? (value as EntryOptionId)
    : null;
}

function parseUserType(value?: string): UserTypeId | null {
  if (!value) return null;
  return userTypes.some((type) => type.id === value)
    ? (value as UserTypeId)
    : null;
}

