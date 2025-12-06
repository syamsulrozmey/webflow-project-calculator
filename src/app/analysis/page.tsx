import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import { UrlIntakeExperience } from "@/components/analysis/url-intake-experience";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { EntryFlow, QuestionnaireUserType } from "@/config/questionnaire";
import { SiteHeader } from "@/components/site-header";
import { AnalysisHeader } from "@/components/analysis/analysis-header";

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" userType="agency" />
      <SidebarInset>
        <SiteHeader />
        <main className="min-h-screen bg-conv-background pb-16 text-conv-text-primary">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-12">
            <AnalysisHeader />
            <UrlIntakeExperience entry={entry} userType={userType} sessionId={session} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}