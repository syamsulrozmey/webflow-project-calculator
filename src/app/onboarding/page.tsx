import type { Metadata } from "next";
import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";

import { OnboardingExperience } from "@/components/onboarding/onboarding-experience";

export const metadata: Metadata = {
  title: "Onboarding · Webflow Project Calculator",
  description:
    "Pick the right entry flow and user type before diving into the questionnaire or crawler.",
};

interface OnboardingPageProps {
  searchParams: Promise<{
    entry?: EntryFlow;
    userType?: QuestionnaireUserType;
  }>;
}

function generateServerSessionId() {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid;
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const params = await searchParams;
  const entry = params?.entry;
  const userType = params?.userType;
  const sessionId = generateServerSessionId();

  return (
    <main className="min-h-screen bg-conv-background pb-16">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <div className="mb-12 max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">
            Project initiation
          </p>
          <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-conv-text-primary md:text-5xl">
            Two flows. Same deterministic engine.
          </h1>
          <p className="text-base leading-relaxed text-conv-text-secondary">
            Whether you're scoping a brand-new build or migrating an existing
            website, the onboarding flow keeps the questionnaire, crawler, and
            exports in sync. Pick what fits today—switch anytime.
          </p>
        </div>
        <OnboardingExperience
          {...(entry && { initialEntryParam: entry })}
          {...(userType && { initialUserTypeParam: userType })}
          initialSessionId={sessionId}
        />
      </div>
    </main>
  );
}

