"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileEdit,
  Globe,
  Layout,
  MoreVertical,
  ShoppingCart,
  Code,
  Copy,
  Download,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Project {
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
}

interface RecentProjectsProps {
  projects: Project[]
  showViewAll?: boolean
}

const typeIcons: Record<Project["type"], React.ReactNode> = {
  landing_page: <Layout className="h-3.5 w-3.5" />,
  small_business: <Globe className="h-3.5 w-3.5" />,
  ecommerce: <ShoppingCart className="h-3.5 w-3.5" />,
  web_app: <Code className="h-3.5 w-3.5" />,
}

const typeLabels: Record<Project["type"], string> = {
  landing_page: "Landing Page",
  small_business: "Small Business",
  ecommerce: "Ecommerce",
  web_app: "Web App",
}

const statusConfig: Record<Project["status"], { label: string; className: string; icon: React.ReactNode }> = {
  draft: { 
    label: "Draft", 
    className: "border-amber-500/50 text-amber-600 bg-amber-500/10",
    icon: <FileEdit className="h-3 w-3" />,
  },
  in_progress: { 
    label: "In Progress", 
    className: "border-blue-500/50 text-blue-600 bg-blue-500/10",
    icon: <Clock className="h-3 w-3" />,
  },
  completed: { 
    label: "Completed", 
    className: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
}

function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export function RecentProjects({ projects, showViewAll = true }: RecentProjectsProps) {
  const [filter, setFilter] = React.useState<"all" | Project["status"]>("all")
  
  const filteredProjects = React.useMemo(() => {
    const filtered = filter === "all" 
      ? projects 
      : projects.filter((p) => p.status === filter)
    return filtered.slice(0, 6)
  }, [projects, filter])

  const statusCounts = React.useMemo(() => ({
    all: projects.length,
    completed: projects.filter((p) => p.status === "completed").length,
    in_progress: projects.filter((p) => p.status === "in_progress").length,
    draft: projects.filter((p) => p.status === "draft").length,
  }), [projects])

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-medium text-foreground">Recent Projects</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="h-8 w-[130px] border-border bg-background text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({statusCounts.all})</SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Completed ({statusCounts.completed})
                </div>
              </SelectItem>
              <SelectItem value="in_progress">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-500" />
                  Active ({statusCounts.in_progress})
                </div>
              </SelectItem>
              <SelectItem value="draft">
                <div className="flex items-center gap-2">
                  <FileEdit className="h-3 w-3 text-amber-500" />
                  Draft ({statusCounts.draft})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {showViewAll && projects.length > 6 && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/projects">View all</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full border border-border bg-muted p-4">
              <FileEdit className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No projects found</p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/questionnaire">Create your first estimate</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => {
              const status = statusConfig[project.status]
              return (
                <div
                  key={project.id}
                  className="group flex items-center justify-between rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {typeIcons[project.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{project.title}</span>
                        <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{typeLabels[project.type]}</span>
                        <span>•</span>
                        <span>{project.hours} hrs</span>
                        <span>•</span>
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(project.estimatedCost, project.currency)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                        <Link href={`/questionnaire?projectId=${project.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="gap-2">
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Download className="h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-rose-500 focus:text-rose-600">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

