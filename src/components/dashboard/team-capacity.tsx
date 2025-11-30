"use client"

import { ChevronDown, ChevronUp, Users, DollarSign, Target, Clock } from "lucide-react"
import * as React from "react"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

interface TeamCapacityProps {
  data: {
    teamMembers: number
    blendedRate: number
    targetMargin: number
    monthlyCapacity: number
    hoursCommitted: number
  }
}

export function TeamCapacity({ data }: TeamCapacityProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  
  const utilizationPercent = Math.round((data.hoursCommitted / data.monthlyCapacity) * 100)
  const availableHours = data.monthlyCapacity - data.hoursCommitted

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const metrics = [
    {
      label: "Team Size",
      value: data.teamMembers,
      suffix: " members",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      label: "Blended Rate",
      value: formatCurrency(data.blendedRate),
      suffix: "/hr",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      label: "Target Margin",
      value: data.targetMargin,
      suffix: "%",
      icon: Target,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
    },
    {
      label: "Available",
      value: availableHours,
      suffix: " hrs",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
  ]

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-foreground">Team Capacity</h3>
              <p className="text-xs text-muted-foreground">
                {utilizationPercent}% utilized this month
              </p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-4">
          {/* Capacity Progress Bar */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Monthly Capacity</span>
              <span className="text-foreground">
                {data.hoursCommitted} / {data.monthlyCapacity} hrs
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPercent > 90
                    ? "bg-rose-500"
                    : utilizationPercent > 70
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-border/30 bg-background p-3"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-3.5 w-3.5 ${metric.color}`} />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {typeof metric.value === "number" ? metric.value : metric.value}
                    <span className="text-xs font-normal text-muted-foreground">{metric.suffix}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

