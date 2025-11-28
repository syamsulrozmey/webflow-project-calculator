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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Active Projects */}
      <Card className="border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <FolderKanban className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-bold tabular-nums text-white">
              {data.activeProjects}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Active Projects
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-white/60">
            {data.totalProjects} total saved
          </p>
        </CardHeader>
      </Card>

      {/* Pipeline Value */}
      <Card className="border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-bold tabular-nums text-white">
              {formatCurrency(data.pipelineValue)}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Pipeline Value
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Total estimated project value
          </p>
        </CardHeader>
      </Card>

      {/* Average Project */}
      <Card className="border-white/10 bg-white/[0.02] transition-colors hover:bg-white/[0.04]">
        <CardHeader className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <CardTitle className="text-3xl font-bold tabular-nums text-white">
              {formatCurrency(data.avgProjectValue)}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Avg Estimate
            </CardDescription>
          </div>
          <p className="mt-2 text-xs text-white/60">
            {data.avgHours} hrs average
          </p>
        </CardHeader>
      </Card>
    </div>
  )
}

