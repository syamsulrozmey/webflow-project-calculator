"use client"

import Link from "next/link"
import { ArrowUpRight, Clock, FileEdit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Project {
  id: string
  title: string
  status: "draft" | "in_progress" | "completed"
  type: "landing_page" | "small_business" | "ecommerce" | "web_app"
  estimatedCost: number
  hours: number
  updatedAt: string
  flow: "fresh" | "existing"
}

interface ContinueWorkingProps {
  projects: Project[]
}

const typeLabels: Record<Project["type"], string> = {
  landing_page: "Landing Page",
  small_business: "Small Business",
  ecommerce: "Ecommerce",
  web_app: "Web App",
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function ContinueWorking({ projects }: ContinueWorkingProps) {
  // Filter to only show draft and in_progress projects, sorted by most recent
  const activeProjects = projects
    .filter((p) => p.status === "draft" || p.status === "in_progress")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  if (activeProjects.length === 0) {
    return null
  }

  return (
    <div className="rounded-2xl border border-conv-border bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-conv-text-secondary" />
        <h3 className="font-serif text-base font-normal leading-tight tracking-tight text-conv-text-primary">Continue Working</h3>
      </div>
      
      <div className="space-y-3">
        {activeProjects.map((project) => (
          <Link
            key={project.id}
            href={`/questionnaire?projectId=${project.id}`}
            className="group flex items-center justify-between rounded-xl border border-conv-border/60 bg-conv-background p-4 transition-all hover:-translate-y-0.5 hover:border-conv-border hover:bg-white hover:shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-conv-primary/10">
                <FileEdit className="h-4 w-4 text-conv-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-conv-text-primary">{project.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      project.status === "draft" 
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-600" 
                        : "border-conv-primary/50 bg-conv-primary/10 text-conv-primary"
                    }`}
                  >
                    {project.status === "draft" ? "Draft" : "In Progress"}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-conv-text-muted">
                  <span>{typeLabels[project.type]}</span>
                  <span>•</span>
                  <span>{formatCurrency(project.estimatedCost)}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(project.updatedAt)}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

