"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createBlankMember } from "@/hooks/use-agency-team";
import type { AgencyRateSummary, AgencyTeamMember, AgencyTeamState } from "@/lib/agency/types";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface AgencyTeamConfiguratorProps {
  state: AgencyTeamState;
  summary: AgencyRateSummary;
  hidden?: boolean;
  onUpsert: (member: AgencyTeamMember) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onSettingsChange: (settings: Partial<Omit<AgencyTeamState, "members">>) => void;
}

export function AgencyTeamConfigurator({
  state,
  summary,
  hidden,
  onUpsert,
  onRemove,
  onReset,
  onSettingsChange,
}: AgencyTeamConfiguratorProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  if (hidden) {
    return null;
  }

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary">Agency economics</p>
            <CardTitle className="text-xl">Team blend & margin guardrails</CardTitle>
            <CardDescription>
              Manage internal costs, capacity, and markup to auto-fill the hourly rate question.
            </CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>
              Internal:{" "}
              <span className="font-semibold text-white">
                ${summary.blendedCostRate.toFixed(2)} / hr
              </span>
            </p>
            <p>
              Client quote:{" "}
              <span className="font-semibold text-white">
                ${summary.recommendedBillableRate.toFixed(2)} / hr
              </span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Members" value={`${summary.memberCount}`} helper="Delivery roles" />
          <Metric
            label="Weekly capacity"
            value={`${summary.totalWeeklyCapacity} hrs`}
            helper="Sum of allocated hours"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Margin</p>
            <div className="mt-1 flex items-baseline gap-2">
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.01"
                value={state.targetMargin}
                onChange={(event) =>
                  onSettingsChange({ targetMargin: Number(event.currentTarget.value) })
                }
                className="h-2 w-full cursor-pointer accent-primary"
              />
              <span className="text-lg font-semibold text-white">
                {(state.targetMargin * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              We’ll hit the higher of margin or markup when suggesting billable rate.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {state.members.map((member) => (
            <div
              key={member.id}
              className={cn(
                "rounded-2xl border border-white/10 bg-white/[0.02] p-4",
                editingMemberId === member.id && "border-primary/60 bg-primary/5",
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    className="bg-transparent text-base font-semibold text-white placeholder:text-muted-foreground"
                    value={member.name}
                    onChange={(event) =>
                      onUpsert({ ...member, name: event.currentTarget.value })
                    }
                    placeholder="Role nickname"
                  />
                  <input
                    type="text"
                    className="bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/70"
                    value={member.role}
                    onChange={(event) =>
                      onUpsert({ ...member, role: event.currentTarget.value })
                    }
                    placeholder="Role description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 border-white/20"
                    onClick={() => setEditingMemberId(member.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => onRemove(member.id)}
                    disabled={state.members.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editingMemberId === member.id && (
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <Field
                    label="Cost rate"
                    prefix="$"
                    value={member.costRate}
                    onChange={(value) => onUpsert({ ...member, costRate: value })}
                  />
                  <Field
                    label="Billable rate"
                    prefix="$"
                    value={member.billableRate ?? 0}
                    onChange={(value) => onUpsert({ ...member, billableRate: value })}
                  />
                  <Field
                    label="Weekly hours"
                    suffix="hrs"
                    value={member.weeklyCapacity ?? 30}
                    onChange={(value) => onUpsert({ ...member, weeklyCapacity: value })}
                  />
                  <Field
                    label="Utilization"
                    suffix="%"
                    value={(member.utilizationTarget ?? 0.75) * 100}
                    onChange={(value) =>
                      onUpsert({ ...member, utilizationTarget: value / 100 })
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="gap-2"
            onClick={() => {
              const blank = createBlankMember();
              setEditingMemberId(blank.id);
              onUpsert(blank);
            }}
          >
            <Plus className="h-4 w-4" />
            Add contributor
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onReset();
              setEditingMemberId(null);
            }}
          >
            Reset to defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function Field({
  label,
  prefix,
  suffix,
  value,
  onChange,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm text-muted-foreground">
      {label}
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-white">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={0}
          step="1"
          className="w-full bg-transparent text-white outline-none"
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}


