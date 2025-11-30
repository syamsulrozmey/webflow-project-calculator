"use client"

import { CheckCircle2, Clock, FileEdit } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProjectsByStatusProps {
  data: {
    completed: number
    inProgress: number
    draft: number
  }
}

export function ProjectsByStatus({ data }: ProjectsByStatusProps) {
  const total = data.completed + data.inProgress + data.draft
  
  const getPercentage = (value: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const statusItems = [
    {
      label: "Completed",
      value: data.completed,
      percentage: getPercentage(data.completed),
      color: "bg-emerald-500",
      lightColor: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      icon: CheckCircle2,
    },
    {
      label: "In Progress",
      value: data.inProgress,
      percentage: getPercentage(data.inProgress),
      color: "bg-blue-500",
      lightColor: "bg-blue-500/20",
      textColor: "text-blue-400",
      icon: Clock,
    },
    {
      label: "Draft",
      value: data.draft,
      percentage: getPercentage(data.draft),
      color: "bg-amber-500",
      lightColor: "bg-amber-500/20",
      textColor: "text-amber-400",
      icon: FileEdit,
    },
  ]

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">Projects by Status</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {total} total projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md ${item.lightColor}`}>
                  <item.icon className={`h-3.5 w-3.5 ${item.textColor}`} />
                </div>
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium tabular-nums text-foreground">{item.value}</span>
                <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${item.color} transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

