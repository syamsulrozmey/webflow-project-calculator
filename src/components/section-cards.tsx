"use client"

import {
  FolderKanban,
  TrendingDownIcon,
  TrendingUpIcon,
  DollarSign,
  Clock,
  Globe,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  data: {
    totalProjects: number
    totalPipelineValue: number
    avgProjectSize: {
      hours: number
      cost: number
    }
    crawlsThisMonth: number
    projectsThisMonth: number
    projectsTrend: number
    pipelineTrend: number
  }
}

export function SectionCards({ data }: SectionCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
      {/* Total Projects */}
      <Card className="@container/card border-white/10 bg-white/[0.02]">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <FolderKanban className="h-4 w-4" />
            Total Projects
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-white">
            {data.totalProjects}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg border-white/20 text-xs text-white/80">
              {data.projectsTrend >= 0 ? (
                <TrendingUpIcon className="size-3 text-emerald-400" />
              ) : (
                <TrendingDownIcon className="size-3 text-rose-400" />
              )}
              {data.projectsTrend >= 0 ? "+" : ""}{data.projectsTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium text-white">
            +{data.projectsThisMonth} this month
            <TrendingUpIcon className="size-4 shrink-0 text-emerald-400" />
          </div>
          <div className="text-muted-foreground">
            Saved scopes and estimates
          </div>
        </CardFooter>
      </Card>

      {/* Pipeline Value */}
      <Card className="@container/card border-white/10 bg-white/[0.02]">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Pipeline Value
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-white">
            {formatCurrency(data.totalPipelineValue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg border-white/20 text-xs text-white/80">
              {data.pipelineTrend >= 0 ? (
                <TrendingUpIcon className="size-3 text-emerald-400" />
              ) : (
                <TrendingDownIcon className="size-3 text-rose-400" />
              )}
              {data.pipelineTrend >= 0 ? "+" : ""}{data.pipelineTrend.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium text-white">
            Growing steadily
            <TrendingUpIcon className="size-4 shrink-0 text-emerald-400" />
          </div>
          <div className="text-muted-foreground">
            Total estimated project value
          </div>
        </CardFooter>
      </Card>

      {/* Average Project Size */}
      <Card className="@container/card border-white/10 bg-white/[0.02]">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Avg Project Size
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-white">
            {data.avgProjectSize.hours} hrs
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg border-white/20 text-xs text-white/80">
              {formatCurrency(data.avgProjectSize.cost)}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium text-white">
            Typical scope baseline
          </div>
          <div className="text-muted-foreground">
            Based on all projects
          </div>
        </CardFooter>
      </Card>

      {/* Website Crawls */}
      <Card className="@container/card border-white/10 bg-white/[0.02]">
        <CardHeader className="relative">
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            Website Crawls
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-white">
            {data.crawlsThisMonth}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg border-primary/50 bg-primary/10 text-xs text-primary">
              Unlimited
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium text-white">
            Pro feature enabled
          </div>
          <div className="text-muted-foreground">
            Site analyses this month
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
