"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Globe, Layout, ShoppingCart, Code } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PipelineByTypeProps {
  data: {
    landingPage: { count: number; value: number }
    smallBusiness: { count: number; value: number }
    ecommerce: { count: number; value: number }
    webApp: { count: number; value: number }
  }
}

const typeConfig = {
  landingPage: {
    label: "Landing Page",
    color: "#8b5cf6",
    icon: Layout,
  },
  smallBusiness: {
    label: "Small Business",
    color: "#06b6d4",
    icon: Globe,
  },
  ecommerce: {
    label: "Ecommerce",
    color: "#22c55e",
    icon: ShoppingCart,
  },
  webApp: {
    label: "Web App",
    color: "#f59e0b",
    icon: Code,
  },
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function PipelineByType({ data }: PipelineByTypeProps) {
  const chartData = React.useMemo(() => {
    return [
      { name: "Landing Page", value: data.landingPage.value, count: data.landingPage.count, color: typeConfig.landingPage.color },
      { name: "Small Business", value: data.smallBusiness.value, count: data.smallBusiness.count, color: typeConfig.smallBusiness.color },
      { name: "Ecommerce", value: data.ecommerce.value, count: data.ecommerce.count, color: typeConfig.ecommerce.color },
      { name: "Web App", value: data.webApp.value, count: data.webApp.count, color: typeConfig.webApp.color },
    ].filter((item) => item.value > 0)
  }, [data])

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; count: number } }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(item.value)} ({percentage}%)
          </p>
          <p className="text-xs text-muted-foreground">
            {item.count} project{item.count !== 1 ? "s" : ""}
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-foreground">Pipeline by Type</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            No projects yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
            Create your first estimate to see insights
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">Pipeline by Type</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {formatCurrency(totalValue)} total value
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Donut Chart */}
          <div className="relative h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="transparent"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground">{chartData.length}</span>
              <span className="text-[10px] text-muted-foreground">types</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-1 flex-col gap-2">
            {chartData.map((item) => {
              const percentage = totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0
              const config = Object.values(typeConfig).find((c) => c.label === item.name)
              const Icon = config?.icon || Globe
              
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="h-3 w-3" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs text-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

