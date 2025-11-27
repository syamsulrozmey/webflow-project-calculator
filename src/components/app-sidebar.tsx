"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calculator,
  CreditCard,
  FolderKanban,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

// Mock user data - in production this would come from Clerk
const userData = {
  name: "Alex Designer",
  email: "alex@webflowpro.com",
  avatar: "",
  userType: "agency" as const, // "freelancer" | "agency" | "company"
}

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "My Projects",
    url: "/projects",
    icon: FolderKanban,
  },
  {
    title: "New Calculation",
    url: "/questionnaire",
    icon: Calculator,
  },
  {
    title: "Website Analysis",
    url: "/analysis",
    icon: Globe,
  },
]

// Conditional items based on user type
const agencyItems = [
  {
    title: "Team Settings",
    url: "/onboarding",
    icon: Users,
  },
]

const navSecondary = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: HelpCircle,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userType?: "freelancer" | "agency" | "company"
}

export function AppSidebar({ userType = userData.userType, ...props }: AppSidebarProps) {
  // Combine nav items based on user type
  const allNavItems = React.useMemo(() => {
    if (userType === "agency") {
      return [...navMain, ...agencyItems]
    }
    return navMain
  }, [userType])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Webflow Calculator</span>
                  <span className="text-[10px] text-muted-foreground">Pro Workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={allNavItems} />

        <SidebarSeparator className="my-4" />

        {/* Subscription Status */}
        <div className="px-4">
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-white">Pro Plan</span>
              <Badge className="ml-auto bg-primary/20 text-[10px] text-primary hover:bg-primary/30">
                Active
              </Badge>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Unlimited crawls & exports
            </p>
          </div>
        </div>

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
