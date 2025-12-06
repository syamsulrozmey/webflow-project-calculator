"use client"

import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const pageTitles: Record<string, { title: string; badge?: string }> = {
  "/dashboard": { title: "Dashboard", badge: "Pro" },
  "/projects": { title: "My Projects" },
  "/questionnaire": { title: "New Calculation" },
  "/analysis": { title: "Website Analysis" },
  "/onboarding": { title: "Team Settings" },
  "/settings": { title: "Settings" },
  "/results": { title: "Results" },
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageInfo = pageTitles[pathname] || { title: "Dashboard" }

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b border-conv-border bg-white/90 backdrop-blur-md transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 bg-conv-border data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-lg font-normal leading-tight tracking-tight text-conv-text-primary">{pageInfo.title}</h1>
          {pageInfo.badge && (
            <Badge className="bg-conv-primary/10 text-[10px] text-conv-primary hover:bg-conv-primary/20">
              {pageInfo.badge}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
