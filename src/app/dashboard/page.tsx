import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { AgencyCards } from "@/components/agency-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

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

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" userType={userType} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* KPI Cards */}
              <SectionCards data={dashboardData.summary} />

              {/* Conditional Agency Section */}
              {userType === "agency" && (
                <AgencyCards data={dashboardData.agencyProfile} />
              )}

              {/* Chart */}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive data={dashboardData.chartData} />
              </div>

              {/* Projects Table */}
              <div className="px-4 lg:px-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">Your Projects</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your saved scopes, estimates, and proposals
                  </p>
                </div>
              </div>
              <DataTable data={dashboardData.projects} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
