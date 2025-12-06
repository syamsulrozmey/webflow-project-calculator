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
      colorVar: "--primary",
    },
    {
      label: "Blended Rate",
      value: formatCurrency(data.blendedRate),
      suffix: "/hr",
      icon: DollarSign,
      colorVar: "--success",
    },
    {
      label: "Target Margin",
      value: data.targetMargin,
      suffix: "%",
      icon: Target,
      colorVar: "--warning",
    },
    {
      label: "Available",
      value: availableHours,
      suffix: " hrs",
      icon: Clock,
      colorVar: "--primary",
    },
  ]

  return (
    <Card className="rounded-2xl border border-conv-border bg-white shadow-card">
      <CardHeader className="pb-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-conv-primary/10">
              <Users className="h-4 w-4 text-conv-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-serif text-base font-normal leading-tight tracking-tight text-conv-text-primary">Team Capacity</h3>
              <p className="text-xs text-conv-text-muted">
                {utilizationPercent}% utilized this month
              </p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-conv-background transition-colors">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-conv-text-secondary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-conv-text-secondary" />
            )}
          </div>
        </button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-4">
          {/* Capacity Progress Bar */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-conv-text-muted">Monthly Capacity</span>
              <span className="text-conv-text-primary">
                {data.hoursCommitted} / {data.monthlyCapacity} hrs
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-conv-background-alt">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(utilizationPercent, 100)}%`,
                  backgroundColor:
                    utilizationPercent > 90
                      ? "hsl(var(--destructive))"
                      : utilizationPercent > 70
                      ? "hsl(var(--warning))"
                      : "hsl(var(--primary))",
                }}
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-conv-border/60 bg-conv-background p-3"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `hsla(var(${metric.colorVar}), 0.14)` }}
                >
                  <metric.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${metric.colorVar}))` }} />
                </div>
                <div className="mt-2">
                  <p className="text-lg font-semibold tabular-nums text-conv-text-primary">
                    {typeof metric.value === "number" ? metric.value : metric.value}
                    <span className="text-xs font-normal text-conv-text-muted">{metric.suffix}</span>
                  </p>
                  <p className="text-[11px] text-conv-text-muted">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

