"use client"

import { ShieldAlert, Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useWorkspace } from "@/hooks/use-workspace"
import { isFreeTier } from "@/lib/export/feature-tier"

export function AnalysisHeader() {
  const { tier, usage } = useWorkspace()
  const isFree = isFreeTier(tier)
  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
        <Sparkles className="h-4 w-4" />
        Existing site analysis
      </div>
      <p className="font-serif text-3xl font-normal tracking-tight text-conv-text-primary">Capture the current footprint before migrating.</p>
      <p className="text-base text-conv-text-secondary leading-relaxed">
        We'll crawl the URL, detect stack + complexity, and feed it into the streamlined questionnaire.
      </p>
      <Card className="bg-white border-conv-border shadow-card">
        <CardContent className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm text-conv-text-secondary">
          <span className="rounded-full border border-conv-border bg-conv-background-alt px-3 py-1 text-xs">
            Plan: {isFree ? "Free" : "Pro"}
          </span>
          <span className="rounded-full border border-conv-border bg-conv-background-alt px-3 py-1 text-xs">
            Crawls: {usage.crawlsUsed}/{usage.crawlsLimit}
          </span>
          <span className="rounded-full border border-conv-border bg-conv-background-alt px-3 py-1 text-xs">
            Exports: {usage.exportsUsed}/{usage.exportsLimit}
          </span>
          {isFree && (
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <ShieldAlert className="h-4 w-4" />
              Free tier capped at light crawls. Upgrade for higher limits.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

