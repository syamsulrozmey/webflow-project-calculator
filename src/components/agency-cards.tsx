"use client"

import {
  Users,
  DollarSign,
  Target,
  Clock,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AgencyCardsProps {
  data: {
    teamMembers: number
    blendedRate: number
    targetMargin: number
    monthlyCapacity: number
  }
}

export function AgencyCards({ data }: AgencyCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Agency Overview</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
        {/* Team Members */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader className="p-4">
            <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Team Size
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-white">
              {data.teamMembers}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Blended Rate */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader className="p-4">
            <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              Blended Rate
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-white">
              {formatCurrency(data.blendedRate)}/hr
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Target Margin */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader className="p-4">
            <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Target Margin
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-white">
              {data.targetMargin}%
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Monthly Capacity */}
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader className="p-4">
            <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Monthly Capacity
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-white">
              {data.monthlyCapacity} hrs
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

