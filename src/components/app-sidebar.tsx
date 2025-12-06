"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  CreditCard,
  FolderKanban,
  Globe,
  HelpCircle,
  PlusCircle,
  Settings,
  Sparkles,
  Users,
  Zap,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWorkspace } from "@/hooks/use-workspace"
import { isFreeTier } from "@/lib/export/feature-tier"

const navMain = [
  {
    title: "Projects",
    url: "/dashboard",
    icon: FolderKanban,
  },
  {
    title: "Analysis",
    url: "/analysis",
    icon: Globe,
  },
  {
    title: "Results / Exports",
    url: "/results",
    icon: Sparkles,
  },
]

// Conditional items based on user type
const agencyItems = [
  {
    title: "Team",
    url: "/team",
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
    title: "Billing & Plan",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Docs / FAQ",
    url: "/docs",
    icon: HelpCircle,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userType?: "freelancer" | "agency" | "company"
}

export function AppSidebar({ userType = "agency", ...props }: AppSidebarProps) {
  const { tier, usage, user, resumeProjectId, routeContext } = useWorkspace()
  const pathname = usePathname()
  const router = useRouter()
  
  // Combine nav items based on user type
  const allNavItems = React.useMemo(() => {
    if (userType === "agency") {
      return [...navMain, ...agencyItems]
    }
    return navMain
  }, [userType])

  const handleNewEstimate = (type: "fresh" | "existing") => {
    if (type === "fresh") {
      router.push("/questionnaire")
    } else {
      router.push("/analysis")
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props} className="bg-white text-conv-text-primary">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-conv-primary/10">
                  <Sparkles className="h-4 w-4 text-conv-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-conv-text-primary">Webflow Calculator</span>
                  <span className="text-[10px] text-conv-text-muted">
                    {isFreeTier(tier) ? "Free workspace" : "Pro workspace"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Action - New Estimate Dropdown */}
        <div className="px-3 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center justify-between gap-2 rounded-full bg-conv-primary px-5 py-3 text-sm font-medium text-white shadow-button transition-all hover:-translate-y-0.5 hover:bg-conv-primary-hover hover:shadow-button-hover focus:outline-none focus:ring-2 focus:ring-conv-primary/50">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>New Estimate</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-[calc(var(--sidebar-width)-1.5rem)] border border-conv-border bg-white shadow-card"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onClick={() => handleNewEstimate("fresh")}
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 focus:bg-conv-background"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-conv-primary/10">
                  <Zap className="h-4 w-4 text-conv-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-conv-text-primary">Fresh Project</span>
                  <span className="text-xs text-conv-text-muted">Start from scratch with questionnaire</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNewEstimate("existing")}
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 focus:bg-conv-background"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-conv-background">
                  <Globe className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-conv-text-primary">Analyze Existing Site</span>
                  <span className="text-xs text-conv-text-muted">Crawl & estimate from live website</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <NavMain
          items={allNavItems.map((item) => ({
            ...item,
            isActive: pathname === item.url || routeContext.pathname === item.url,
          }))}
        />

        <div className="px-3">
          <div className="mt-3 rounded-xl border border-conv-border bg-conv-background p-3 text-xs text-conv-text-muted">
            <div className="flex items-center gap-2 text-conv-text-primary">
              <CreditCard className="h-3.5 w-3.5 text-conv-primary" />
              <span className="text-[11px] uppercase tracking-wide">
                Plan: {isFreeTier(tier) ? "Free" : "Pro"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <UsageBadge label="Crawls" used={usage.crawlsUsed} limit={usage.crawlsLimit} />
              <UsageBadge label="Exports" used={usage.exportsUsed} limit={usage.exportsLimit} />
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href={resumeProjectId ? `/questionnaire?projectId=${resumeProjectId}` : "/questionnaire"}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-conv-border px-3 py-2 text-[11px] font-medium text-conv-text-primary transition hover:border-conv-primary hover:text-conv-primary"
              >
                Resume last
              </Link>
              <Link
                href="/results"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-conv-border px-3 py-2 text-[11px] font-medium text-conv-text-primary transition hover:border-conv-primary hover:text-conv-primary"
              >
                View exports
              </Link>
            </div>
          </div>
        </div>

        <SidebarSeparator className="my-4" />

        {/* Subscription Status */}
        <div className="px-4">
          <div className="rounded-xl border border-conv-border bg-conv-background p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-conv-primary" />
              <span className="text-xs font-medium text-conv-text-primary">
                {isFreeTier(tier) ? "Free Plan" : "Pro Plan"}
              </span>
              <Badge className="ml-auto bg-conv-primary/10 text-[10px] text-conv-primary hover:bg-conv-primary/20">
                {isFreeTier(tier) ? "Limited" : "Active"}
              </Badge>
            </div>
            <p className="mt-1 text-[10px] text-conv-text-muted">
              {isFreeTier(tier) ? "Limited crawls & watermarked exports" : "Unlimited crawls & exports"}
            </p>
          </div>
        </div>

        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: user.name,
            email: user.email,
            avatar: user.avatarUrl,
            userType,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

function UsageBadge({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percent = Math.min(Math.round((used / limit) * 100), 100)
  return (
    <div className="rounded-lg border border-conv-border/60 bg-white/5 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium text-conv-text-primary">
        <span>{label}</span>
        <span className="text-conv-text-muted">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-conv-background">
        <div
          className="h-1.5 rounded-full bg-conv-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
