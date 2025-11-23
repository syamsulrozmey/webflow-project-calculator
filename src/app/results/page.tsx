import type { Metadata } from "next";

import { ResultsExperience } from "@/components/results/results-experience";
import { getDemoCalculation } from "@/lib/demo/calculation";

export const metadata: Metadata = {
  title: "Results · Webflow Project Calculator",
  description:
    "Review total cost, timeline, and per-phase breakdown for your Webflow project estimate.",
};

export default function ResultsPage() {
  const result = getDemoCalculation();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05060a] via-[#05060a] to-[#0b0f1b] pb-20 text-white">
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:px-12">
        <div className="mb-10 space-y-3">
          <p className="text-xs text-primary">Cost breakdown</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Share a client-ready cost story in minutes.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Toggle between detailed line items, tiered rollups, and a visual timeline. Copy a public
            link when you are ready to share with clients or teammates.
          </p>
        </div>
        <ResultsExperience result={result} fallbackSource="demo" />
      </section>
    </main>
  );
}


