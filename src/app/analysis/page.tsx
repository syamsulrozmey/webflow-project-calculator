import type { Metadata } from "next";

import { UrlIntakeExperience } from "@/components/analysis/url-intake-experience";
import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";

export const metadata: Metadata = {
  title: "Existing Site Analysis · Webflow Project Calculator",
  description:
    "Input a URL to capture sitemap scope, stack insights, and migration complexity before running the streamlined questionnaire.",
};

interface AnalysisPageProps {
  searchParams?: {
    entry?: EntryFlow;
    userType?: QuestionnaireUserType;
    session?: string;
  };
}

export default function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const entry = searchParams?.entry ?? "existing";
  const userType = searchParams?.userType ?? null;
  const session = searchParams?.session ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] via-[#05060a] to-[#0b0f1b] pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <UrlIntakeExperience entry={entry} userType={userType} sessionId={session} />
      </div>
    </main>
  );
}

