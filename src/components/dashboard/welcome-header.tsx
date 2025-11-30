"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, Globe, PlusCircle, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WelcomeHeaderProps {
  userName: string
  activeProjects: number
  pipelineValue: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function WelcomeHeader({ userName, activeProjects, pipelineValue }: WelcomeHeaderProps) {
  const router = useRouter()
  const firstName = userName.split(" ")[0]

  const handleNewEstimate = (type: "fresh" | "existing") => {
    if (type === "fresh") {
      router.push("/questionnaire")
    } else {
      router.push("/analysis")
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-black">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeProjects > 0 ? (
            <>
              You have <span className="text-foreground font-medium">{activeProjects} active project{activeProjects !== 1 ? "s" : ""}</span> worth{" "}
              <span className="text-foreground font-medium">{formatCurrency(pipelineValue)}</span>
            </>
          ) : (
            "Start your first estimate to begin tracking your pipeline"
          )}
        </p>
      </div>
      
      {/* Desktop button with dropdown */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Estimate
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuItem 
              onClick={() => handleNewEstimate("fresh")}
              className="cursor-pointer gap-3 rounded-lg px-3 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Fresh Project</span>
                <span className="text-xs text-muted-foreground">Start from scratch</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleNewEstimate("existing")}
              className="cursor-pointer gap-3 rounded-lg px-3 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                <Globe className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">Analyze Existing Site</span>
                <span className="text-xs text-muted-foreground">Crawl live website</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile buttons */}
      <div className="flex gap-2 sm:hidden">
        <Button asChild size="sm" className="flex-1">
          <Link href="/questionnaire">
            <Zap className="mr-2 h-4 w-4" />
            Fresh Project
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1">
          <Link href="/analysis">
            <Globe className="mr-2 h-4 w-4" />
            Analyze Site
          </Link>
        </Button>
      </div>
    </div>
  )
}

