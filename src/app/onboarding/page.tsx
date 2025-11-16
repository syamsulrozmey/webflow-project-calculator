import type { Metadata } from "next";

import { OnboardingExperience } from "@/components/onboarding/onboarding-experience";

export const metadata: Metadata = {
  title: "Onboarding · Webflow Project Calculator",
  description:
    "Pick the right entry flow and user type before diving into the questionnaire or crawler.",
};

interface OnboardingPageProps {
  searchParams?: {
    entry?: string;
    userType?: string;
  };
}

export default function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const entry = searchParams?.entry;
  const userType = searchParams?.userType;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] via-[#05060a] to-[#0b0f1b] pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <div className="mb-12 max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">
            Project initiation
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Two flows. Same deterministic engine.
          </h1>
          <p className="text-base text-muted-foreground">
            Whether you’re scoping a brand-new build or migrating an existing
            website, the onboarding flow keeps the questionnaire, crawler, and
            exports in sync. Pick what fits today—switch anytime.
          </p>
        </div>
        <OnboardingExperience
          initialEntryParam={entry}
          initialUserTypeParam={userType}
        />
      </div>
    </main>
  );
}

