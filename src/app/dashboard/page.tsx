import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  CoreMetrics,
  ContinueWorking,
  ProjectsByStatus,
  PipelineByType,
  TeamCapacity,
  WelcomeHeader,
  RecentProjects,
} from "@/components/dashboard"

import dashboardDataRaw from "./data.json"

// Type the imported JSON data
interface DashboardData {
  summary: {
    totalProjects: number
    totalPipelineValue: number
    avgProjectSize: {
      hours: number
      cost: number
    }
    crawlsThisMonth: number
    projectsThisMonth: number
    projectsTrend: number
    pipelineTrend: number
  }
  agencyProfile: {
    teamMembers: number
    blendedRate: number
    targetMargin: number
    monthlyCapacity: number
  }
  chartData: Array<{
    date: string
    projects: number
    value: number
  }>
  projects: Array<{
    id: string
    title: string
    type: "landing_page" | "small_business" | "ecommerce" | "web_app"
    flow: "fresh" | "existing"
    status: "draft" | "in_progress" | "completed"
    estimatedCost: number
    hours: number
    currency: string
    persona: "freelancer" | "agency" | "company"
    updatedAt: string
  }>
}

const dashboardData = dashboardDataRaw as DashboardData

// Mock user type - in production this would come from Clerk session
const userType = "agency" as const // "freelancer" | "agency" | "company"
const userName = "Alex Designer"

// Compute derived metrics
function computeMetrics(data: DashboardData) {
  const activeProjects = data.projects.filter(
    (p) => p.status === "draft" || p.status === "in_progress"
  ).length
  const completedProjects = data.projects.filter((p) => p.status === "completed").length
  const draftProjects = data.projects.filter((p) => p.status === "draft").length
  const inProgressProjects = data.projects.filter((p) => p.status === "in_progress").length

  // Calculate pipeline by type
  const pipelineByType = {
    landingPage: { count: 0, value: 0 },
    smallBusiness: { count: 0, value: 0 },
    ecommerce: { count: 0, value: 0 },
    webApp: { count: 0, value: 0 },
  }

  data.projects.forEach((project) => {
    switch (project.type) {
      case "landing_page":
        pipelineByType.landingPage.count++
        pipelineByType.landingPage.value += project.estimatedCost
        break
      case "small_business":
        pipelineByType.smallBusiness.count++
        pipelineByType.smallBusiness.value += project.estimatedCost
        break
      case "ecommerce":
        pipelineByType.ecommerce.count++
        pipelineByType.ecommerce.value += project.estimatedCost
        break
      case "web_app":
        pipelineByType.webApp.count++
        pipelineByType.webApp.value += project.estimatedCost
        break
    }
  })

  // Calculate hours committed (from active projects)
  const hoursCommitted = data.projects
    .filter((p) => p.status === "in_progress")
    .reduce((sum, p) => sum + p.hours, 0)

  return {
    activeProjects,
    completedProjects,
    draftProjects,
    inProgressProjects,
    pipelineByType,
    hoursCommitted,
  }
}

const metrics = computeMetrics(dashboardData)

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" userType={userType} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Welcome Header */}
            <WelcomeHeader
              userName={userName}
              activeProjects={metrics.activeProjects}
              pipelineValue={dashboardData.summary.totalPipelineValue}
            />

            {/* Core Metrics */}
            <CoreMetrics
              data={{
                activeProjects: metrics.activeProjects,
                totalProjects: dashboardData.summary.totalProjects,
                pipelineValue: dashboardData.summary.totalPipelineValue,
                avgProjectValue: dashboardData.summary.avgProjectSize.cost,
                avgHours: dashboardData.summary.avgProjectSize.hours,
              }}
            />

            {/* Continue Working (only shows if there are active/draft projects) */}
            <ContinueWorking projects={dashboardData.projects} />

            {/* Team Capacity - Agency Only */}
            {userType === "agency" && (
              <TeamCapacity
                data={{
                  teamMembers: dashboardData.agencyProfile.teamMembers,
                  blendedRate: dashboardData.agencyProfile.blendedRate,
                  targetMargin: dashboardData.agencyProfile.targetMargin,
                  monthlyCapacity: dashboardData.agencyProfile.monthlyCapacity,
                  hoursCommitted: metrics.hoursCommitted,
                }}
              />
            )}

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ProjectsByStatus
                data={{
                  completed: metrics.completedProjects,
                  inProgress: metrics.inProgressProjects,
                  draft: metrics.draftProjects,
                }}
              />
              <PipelineByType data={metrics.pipelineByType} />
            </div>

            {/* Recent Projects */}
            <RecentProjects projects={dashboardData.projects} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
