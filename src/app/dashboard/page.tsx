import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"

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
      <AppSidebar variant="sidebar" userType="agency" />
      <SidebarInset>
        <SiteHeader />
        <DashboardScreen />
      </SidebarInset>
    </SidebarProvider>
  )
}
