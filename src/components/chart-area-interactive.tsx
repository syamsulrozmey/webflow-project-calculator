"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

interface ChartDataPoint {
  date: string
  projects: number
  value: number
}

interface ChartAreaInteractiveProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  projects: {
    label: "Projects",
    color: "hsl(var(--primary))",
  },
  value: {
    label: "Value",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [metric, setMetric] = React.useState<"projects" | "value">("value")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("30d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date(data[data.length - 1]?.date || new Date())
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return data.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate
    })
  }, [data, timeRange])

  // Calculate cumulative values for the chart
  const cumulativeData = React.useMemo(() => {
    let cumulativeProjects = 0
    let cumulativeValue = 0
    return filteredData.map((item) => {
      cumulativeProjects += item.projects
      cumulativeValue += item.value
      return {
        ...item,
        cumulativeProjects,
        cumulativeValue,
      }
    })
  }, [filteredData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalProjects = cumulativeData[cumulativeData.length - 1]?.cumulativeProjects || 0
  const totalValue = cumulativeData[cumulativeData.length - 1]?.cumulativeValue || 0

  return (
    <Card className="@container/card border-white/10 bg-white/[0.02]">
      <CardHeader className="relative">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-white">
            {metric === "projects" ? "Projects Created" : "Pipeline Value"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            <span className="@[540px]/card:block hidden">
              {metric === "projects"
                ? `${totalProjects} projects in the selected period`
                : `${formatCurrency(totalValue)} total estimated value`}
            </span>
            <span className="@[540px]/card:hidden">
              {metric === "projects" ? `${totalProjects} projects` : formatCurrency(totalValue)}
            </span>
          </CardDescription>
        </div>
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          {/* Metric Toggle */}
          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={(value) => value && setMetric(value as "projects" | "value")}
            variant="outline"
            className="@[540px]/card:flex hidden"
          >
            <ToggleGroupItem value="value" className="h-8 px-2.5 text-xs">
              Pipeline Value
            </ToggleGroupItem>
            <ToggleGroupItem value="projects" className="h-8 px-2.5 text-xs">
              Projects
            </ToggleGroupItem>
          </ToggleGroup>
          {/* Time Range Toggle */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5 text-xs">
              3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5 text-xs">
              30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5 text-xs">
              7 days
            </ToggleGroupItem>
          </ToggleGroup>
          {/* Mobile Selects */}
          <div className="@[767px]/card:hidden flex gap-2">
            <Select value={metric} onValueChange={(v) => setMetric(v as "projects" | "value")}>
              <SelectTrigger className="@[540px]/card:hidden flex w-28" aria-label="Select metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="value" className="rounded-lg">Value</SelectItem>
                <SelectItem value="projects" className="rounded-lg">Projects</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="flex w-28" aria-label="Select time range">
                <SelectValue placeholder="3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">3 months</SelectItem>
                <SelectItem value="30d" className="rounded-lg">30 days</SelectItem>
                <SelectItem value="7d" className="rounded-lg">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-projects)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-projects)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={metric === "value" ? 60 : 40}
              tickFormatter={(value) => {
                if (metric === "value") {
                  return `$${(value / 1000).toFixed(0)}k`
                }
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === "cumulativeValue") {
                      return [formatCurrency(value as number), "Total Value"]
                    }
                    if (name === "cumulativeProjects") {
                      return [value, "Total Projects"]
                    }
                    return [value, name]
                  }}
                  indicator="dot"
                />
              }
            />
            {metric === "value" ? (
              <Area
                dataKey="cumulativeValue"
                type="monotone"
                fill="url(#fillValue)"
                stroke="var(--color-value)"
                strokeWidth={2}
              />
            ) : (
              <Area
                dataKey="cumulativeProjects"
                type="monotone"
                fill="url(#fillProjects)"
                stroke="var(--color-projects)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
