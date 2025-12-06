"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import {
  CoreMetrics,
  ContinueWorking,
  PipelineByType,
  ProjectsByStatus,
  RecentProjects,
  TeamCapacity,
  WelcomeHeader,
} from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import dashboardDataRaw from "@/app/dashboard/data.json"
import { useWorkspace } from "@/hooks/use-workspace"
import type { ProjectSummary } from "@/lib/projects/types"
import { isFreeTier } from "@/lib/export/feature-tier"

type DashboardData = typeof dashboardDataRaw
type DashboardProject = DashboardData["projects"][number]

export function coerceProject(summary: ProjectSummary): DashboardProject {
  const fallbackCost = summary.hourlyRate ? Math.max(1800, summary.hourlyRate * 32) : 3200
  const fallbackHours = summary.hourlyRate ? 32 : 40
  return {
    id: summary.id,
    title: summary.title,
    type: "landing_page",
    flow: summary.flow,
    status: (summary.status as DashboardProject["status"]) ?? "draft",
    estimatedCost: fallbackCost,
    hours: fallbackHours,
    currency: summary.currency,
    persona: (summary.persona as DashboardProject["persona"]) ?? "agency",
    updatedAt: summary.updatedAt,
  }
}

export function computeMetrics(projects: DashboardProject[], fallback: DashboardData["summary"]) {
  if (projects.length === 0) {
    return {
      summary: fallback,
      pipelineByType: {
        landingPage: { count: 0, value: 0 },
        smallBusiness: { count: 0, value: 0 },
        ecommerce: { count: 0, value: 0 },
        webApp: { count: 0, value: 0 },
      },
    }
  }
  const summary = {
    totalProjects: projects.length,
    totalPipelineValue: projects.reduce((sum, p) => sum + p.estimatedCost, 0),
    avgProjectSize: {
      hours: Math.round(
        projects.reduce((sum, p) => sum + p.hours, 0) / Math.max(projects.length, 1),
      ),
      cost: Math.round(
        projects.reduce((sum, p) => sum + p.estimatedCost, 0) / Math.max(projects.length, 1),
      ),
    },
    crawlsThisMonth: 0,
    projectsThisMonth: 0,
    projectsTrend: 0,
    pipelineTrend: 0,
  }

  const pipelineByType = {
    landingPage: { count: 0, value: 0 },
    smallBusiness: { count: 0, value: 0 },
    ecommerce: { count: 0, value: 0 },
    webApp: { count: 0, value: 0 },
  }

  projects.forEach((project) => {
    const bucket = pipelineByType[project.type] ?? pipelineByType.landingPage
    bucket.count += 1
    bucket.value += project.estimatedCost
  })

  return { summary, pipelineByType }
}

export function DashboardScreen() {
  const { projects, projectsLoading, tier, usage, user } = useWorkspace()

  const preparedProjects = React.useMemo(() => {
    if (projects.length === 0) return dashboardDataRaw.projects
    return projects.map(coerceProject)
  }, [projects])

  const { summary, pipelineByType } = React.useMemo(
    () => computeMetrics(preparedProjects, dashboardDataRaw.summary),
    [preparedProjects],
  )

  const usingDemoData = projects.length === 0

  const completed = preparedProjects.filter((p) => p.status === "completed").length
  const inProgress = preparedProjects.filter((p) => p.status === "in_progress").length
  const draft = preparedProjects.filter((p) => p.status === "draft").length

  return (
    <div className="flex flex-1 flex-col bg-conv-background">
      <section className="bg-conv-background">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-6 px-6 py-10 md:px-8 md:py-12 lg:px-12 lg:py-14">
          <WelcomeHeader
            userName={user.name}
            activeProjects={inProgress + draft}
            pipelineValue={summary.totalPipelineValue}
          />

          <UsageStrip tier={tier} usage={usage} loading={projectsLoading} />

          {usingDemoData && (
            <Card className="border-amber-200 bg-amber-50 shadow-none !shadow-none ring-0">
              <CardContent className="flex flex-col gap-2 px-4 py-3 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-700">Demo data</p>
                  <p>Your workspace has no saved projects yet. Start an estimate to replace this demo view.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ButtonLink href="/questionnaire">New questionnaire</ButtonLink>
                  <ButtonLink href="/analysis" variant="ghost" className="text-amber-900 hover:text-amber-900">
                    Analyze a site
                  </ButtonLink>
                </div>
              </CardContent>
            </Card>
          )}

          <CoreMetrics
            data={{
              activeProjects: inProgress + draft,
              totalProjects: summary.totalProjects,
              pipelineValue: summary.totalPipelineValue,
              avgProjectValue: summary.avgProjectSize.cost,
              avgHours: summary.avgProjectSize.hours,
            }}
          />

          <ContinueWorking projects={preparedProjects} />

          {user.userType === "agency" && (
            <TeamCapacity
              data={{
                teamMembers: 4,
                blendedRate: 95,
                targetMargin: 25,
                monthlyCapacity: 640,
                hoursCommitted: inProgress * 40,
              }}
            />
          )}
        </div>
      </section>

      <section className="bg-conv-background border-t border-conv-border/60">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-6 px-6 py-10 md:px-8 md:py-12 lg:px-12 lg:py-14">
          <div className="grid gap-6 lg:grid-cols-2">
            <ProjectsByStatus
              data={{
                completed,
                inProgress,
                draft,
              }}
            />
            <PipelineByType data={pipelineByType} />
          </div>

          <RecentProjects projects={preparedProjects} />
        </div>
      </section>
    </div>
  )
}

function UsageStrip({
  tier,
  usage,
  loading,
}: {
  tier: string
  usage: { crawlsUsed: number; crawlsLimit: number; exportsUsed: number; exportsLimit: number }
  loading: boolean
}) {
  return (
    <Card className="border-conv-border bg-white shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-conv-text-muted">
          <Sparkles className="h-3.5 w-3.5 text-conv-primary" />
          Workspace plan
        </div>
        <div className="rounded-full border border-conv-border px-3 py-1 text-[11px] font-medium text-conv-text-primary bg-conv-background">
          {isFreeTier(tier as any) ? "Free" : "Pro"}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm md:grid-cols-2">
        <UsagePill
          label="Crawls"
          used={usage.crawlsUsed}
          limit={usage.crawlsLimit}
          loading={loading}
          hint={isFreeTier(tier as any) ? "Upgrade for higher crawl caps" : "Full capacity"}
        />
        <UsagePill
          label="Exports"
          used={usage.exportsUsed}
          limit={usage.exportsLimit}
          loading={loading}
          hint={isFreeTier(tier as any) ? "Watermark removed on Pro" : "Unlimited exports"}
        />
      </CardContent>
    </Card>
  )
}

function UsagePill({
  label,
  used,
  limit,
  loading,
  hint,
}: {
  label: string
  used: number
  limit: number
  loading?: boolean
  hint?: string
}) {
  const percent = Math.min(Math.round((used / limit) * 100), 100)
  return (
    <div className="rounded-xl border border-conv-border bg-conv-background p-3">
      <div className="flex items-center justify-between text-xs text-conv-text-muted">
        <span>{label}</span>
        <span className="text-conv-text-primary">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-conv-background-alt">
        <div
          className="h-2 rounded-full bg-conv-primary transition-all"
          style={{ width: loading ? "35%" : `${percent}%` }}
        />
      </div>
      {hint && <p className="mt-2 text-[11px] text-conv-text-muted">{hint}</p>}
    </div>
  )
}

function ButtonLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: "solid" | "ghost"
  className?: string
}) {
  const isGhost = variant === "ghost"
  return (
    <Link href={href}>
      <Button
        variant={isGhost ? "ghost" : "default"}
        size="sm"
        className={
          isGhost
            ? `border border-conv-border text-conv-text-primary hover:bg-white ${className ?? ""}`.trim()
            : `bg-conv-primary text-white hover:bg-conv-primary-hover ${className ?? ""}`.trim()
        }
      >
        {children}
      </Button>
    </Link>
  )
}

