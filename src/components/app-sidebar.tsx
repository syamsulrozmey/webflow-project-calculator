"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

// Mock user data - in production this would come from Clerk
const userData = {
  name: "Alex Designer",
  email: "alex@webflowpro.com",
  avatar: "",
  userType: "agency" as const,
}

const navMain = [
  {
    title: "Projects",
    url: "/dashboard",
    icon: FolderKanban,
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
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userType?: "freelancer" | "agency" | "company"
}

export function AppSidebar({ userType = userData.userType, ...props }: AppSidebarProps) {
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
        {/* Primary Action - New Estimate Dropdown */}
        <div className="px-3 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>New Estimate</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-[calc(var(--sidebar-width)-1.5rem)] border-white/10 bg-zinc-900"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onClick={() => handleNewEstimate("fresh")}
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 focus:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">Fresh Project</span>
                  <span className="text-xs text-muted-foreground">Start from scratch with questionnaire</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleNewEstimate("existing")}
                className="cursor-pointer gap-3 rounded-lg px-3 py-3 focus:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Globe className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">Analyze Existing Site</span>
                  <span className="text-xs text-muted-foreground">Crawl & estimate from live website</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
