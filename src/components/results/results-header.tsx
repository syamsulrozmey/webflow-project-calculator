"use client"

import Link from "next/link"
import { ArrowLeft, BadgeCheck, FileDown, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { getFeatureTier, isFreeTier } from "@/lib/export/feature-tier"
import { loadCalculationResult } from "@/lib/calculator/storage"
import { useWorkspace } from "@/hooks/use-workspace"

export function ResultsHeader() {
  const { tier, calculation } = useWorkspace()
  const stored = calculation ?? loadCalculationResult()
  const effectiveTier = tier ?? getFeatureTier()
  const isFree = isFreeTier(effectiveTier)
  const name = stored?.result?.projectName ?? "Demo project"
  const flow = stored?.result?.flow ?? "fresh"
  const persona = stored?.result?.persona ?? "agency"
  const rate = stored?.result?.effectiveHourlyRate ?? 125

  return (
    <div className="mb-10 space-y-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/results" className="text-xs">
              Results
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-conv-primary">Cost breakdown</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight text-conv-text-primary md:text-5xl">
            Share a client-ready cost story in minutes.
          </h1>
          <span className="rounded-full border border-conv-border bg-conv-background-alt px-3 py-1 text-xs text-conv-text-secondary">
            {isFree ? "Free tier · Watermarked export" : "Pro tier · Clean exports"}
          </span>
        </div>
        <p className="max-w-3xl text-base leading-relaxed text-conv-text-secondary">
          Toggle detailed line items, tiered rollups, and a visual timeline. Export a PDF or share a link once you finalize the quote.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-conv-border bg-white px-4 py-3 text-sm shadow-card">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-conv-primary">Project</span>
          <span className="font-semibold text-conv-text-primary">{name}</span>
          <span className="text-xs text-conv-text-secondary">
            {flow === "existing" ? "Existing site analysis" : "Fresh build"} · Persona: {persona}
          </span>
        </div>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-xs text-conv-text-secondary">
          <span className="rounded-full border border-conv-border px-3 py-1">
            Effective rate: ${rate}/hr
          </span>
          <span className="rounded-full border border-conv-border px-3 py-1">
            Tier: {isFree ? "Free" : "Pro"}
          </span>
          <BadgeCheck className="h-4 w-4 text-conv-primary" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline" className="border-conv-border">
            <Link href="/questionnaire">Edit answers</Link>
          </Button>
          <Button asChild size="sm" className="gap-2 shadow-button">
            <Link href="/analysis">
              <Sparkles className="h-4 w-4" />
              New analysis
            </Link>
          </Button>
          {isFree && (
            <Button size="sm" variant="outline" className="gap-2 border-conv-warning text-conv-warning hover:border-conv-warning/80">
              <FileDown className="h-4 w-4" />
              Upgrade for clean PDFs
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

