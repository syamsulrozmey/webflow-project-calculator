import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDemoCalculation } from "@/lib/demo/calculation";
import { ResultsHeader } from "@/components/results/results-header";
import { ResultsBody } from "@/components/results/results-body";

export const metadata: Metadata = {
  title: "Results · Webflow Project Calculator",
  description:
    "Review total cost, timeline, and per-phase breakdown for your Webflow project estimate.",
};

export default function ResultsPage() {
  const fallbackResult = getDemoCalculation();

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
        <div className="flex flex-1 flex-col bg-conv-background pb-20">
          <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 lg:px-12">
            <ResultsHeader />
            <ResultsBody fallbackResult={fallbackResult} />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
