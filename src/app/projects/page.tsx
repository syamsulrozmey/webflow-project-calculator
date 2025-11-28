import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProjectsDashboard } from "@/components/projects/projects-dashboard";

export const metadata: Metadata = {
  title: "Projects · Webflow Project Calculator",
  description:
    "Manage saved Webflow project scopes, duplicate estimates, and reopen questionnaires.",
};

// Mock user type - in production this would come from Clerk session
const userType = "agency" as const

export default function ProjectsPage() {
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
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <ProjectsDashboard />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
