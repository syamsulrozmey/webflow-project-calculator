"use client"

import {
  FolderKanban,
  DollarSign,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CoreMetricsProps {
  data: {
    activeProjects: number
    totalProjects: number
    pipelineValue: number
    avgProjectValue: number
    avgHours: number
  }
}

export function CoreMetrics({ data }: CoreMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {/* Active Projects */}
      <Card className="rounded-2xl border border-conv-border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-conv-primary/10">
              <FolderKanban className="h-5 w-5 text-conv-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-semibold tabular-nums text-conv-text-primary">
              {data.activeProjects}
            </CardTitle>
            <CardDescription className="text-sm text-conv-text-secondary">
              Active Projects
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-conv-text-muted">
            {data.totalProjects} total saved
          </p>
        </CardHeader>
      </Card>

      {/* Pipeline Value */}
      <Card className="rounded-2xl border border-conv-border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-conv-primary/10">
              <DollarSign className="h-5 w-5 text-conv-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-semibold tabular-nums text-conv-text-primary">
              {formatCurrency(data.pipelineValue)}
            </CardTitle>
            <CardDescription className="text-sm text-conv-text-secondary">
              Pipeline Value
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-conv-text-muted">
            Total estimated project value
          </p>
        </CardHeader>
      </Card>

      {/* Average Project */}
      <Card className="rounded-2xl border border-conv-border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-conv-primary/10">
              <TrendingUp className="h-5 w-5 text-conv-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-semibold tabular-nums text-conv-text-primary">
              {formatCurrency(data.avgProjectValue)}
            </CardTitle>
            <CardDescription className="text-sm text-conv-text-secondary">
              Avg Estimate
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-conv-text-muted">
            {data.avgHours} hrs average
          </p>
        </CardHeader>
      </Card>
    </div>
  )
}

