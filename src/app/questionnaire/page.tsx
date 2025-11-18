import type { Metadata } from "next";

import { QuestionnaireExperience } from "@/components/questionnaire/questionnaire-experience";
import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";

export const metadata: Metadata = {
  title: "Questionnaire · Webflow Project Calculator",
  description:
    "Dynamic, data-driven questionnaire for gathering Webflow project requirements.",
};

interface QuestionnairePageProps {
  searchParams?: {
    entry?: EntryFlow;
    userType?: QuestionnaireUserType;
    session?: string;
    projectId?: string;
  };
}

export default function QuestionnairePage({ searchParams }: QuestionnairePageProps) {
  const entry = searchParams?.entry ?? null;
  const userType = searchParams?.userType ?? null;
  const projectId = searchParams?.projectId ?? null;
  const sessionId = searchParams?.session ?? projectId ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] via-[#05060a] to-[#0b0f1b] pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <div className="mb-12 max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-primary">
            Requirements intake
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Capture the project scope with confidence.
          </h1>
          <p className="text-base text-muted-foreground">
            The questionnaire adapts to your answers, saves progress every 30 seconds, and
            keeps advanced prompts optional. Finish each section to unlock the deterministic
            cost engine.
          </p>
        </div>
        <QuestionnaireExperience
          entry={entry}
          userType={userType}
          sessionId={sessionId}
          projectId={projectId}
        />
      </div>
    </main>
  );
}

