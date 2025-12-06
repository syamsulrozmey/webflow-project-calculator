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
      colorVar: "--success",
      icon: CheckCircle2,
    },
    {
      label: "In Progress",
      value: data.inProgress,
      percentage: getPercentage(data.inProgress),
      colorVar: "--primary",
      icon: Clock,
    },
    {
      label: "Draft",
      value: data.draft,
      percentage: getPercentage(data.draft),
      colorVar: "--warning",
      icon: FileEdit,
    },
  ]

  return (
    <Card className="rounded-2xl border border-conv-border bg-white shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-conv-text-primary">Projects by Status</CardTitle>
        <CardDescription className="text-sm text-conv-text-secondary">
          {total} total projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `hsla(var(${item.colorVar}), 0.14)` }}
                >
                  <item.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${item.colorVar}))` }} />
                </div>
                <span className="text-sm text-conv-text-primary">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium tabular-nums text-conv-text-primary">{item.value}</span>
                <span className="text-xs text-conv-text-muted">({item.percentage}%)</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-conv-background-alt">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%`, backgroundColor: `hsl(var(${item.colorVar}))` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

