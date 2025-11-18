"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Copy,
  FolderKanban,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import type { ProjectSummary } from "@/lib/projects/types";

export function ProjectsDashboard() {
  const router = useRouter();
  const {
    projects,
    loading,
    error,
    refresh,
    deleteProject,
    duplicateProject,
  } = useProjects();

  const [pendingAction, setPendingAction] = useState<{
    id: string;
    type: "duplicate" | "delete";
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpen = (project: ProjectSummary) => {
    const search = new URLSearchParams({
      projectId: project.id,
      entry: project.flow,
      userType: project.persona ?? "",
    });
    router.push(`/questionnaire?${search.toString()}`);
  };

  const handleDuplicate = async (projectId: string) => {
    setPendingAction({ id: projectId, type: "duplicate" });
    setActionError(null);
    try {
      await duplicateProject(projectId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to duplicate project right now.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Delete this saved project? This action cannot be undone.",
      );
      if (!confirmed) {
        return;
      }
    }
    setPendingAction({ id: projectId, type: "delete" });
    setActionError(null);
    try {
      await deleteProject(projectId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to delete project right now.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/10 bg-white/[0.05] bg-gradient-to-br from-white/5 via-white/0 to-white/0 text-white shadow-[0_20px_120px_rgba(80,63,205,0.25)]">
        <CardHeader className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-primary/80">
              Pro workspace
            </p>
            <div>
              <CardTitle className="text-3xl font-semibold text-white">
                Saved scopes &amp; quotes
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground">
                Every questionnaire snapshot you save lands here. Resume, duplicate, or
                archive proposals without losing your deterministic cost baseline.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-white/60">
              <BadgePill label="Pro exclusive" />
              <BadgePill label={`${projects.length} saved`} />
              <BadgePill label="Autosave + manual sync" />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => refresh()}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button asChild>
              <Link href="/questionnaire" className="gap-2">
                Start new scope
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-white/10 bg-white/[0.015] text-white">
        <CardContent className="pt-6">
          {actionError && (
            <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {actionError}
            </div>
          )}
          {loading ? (
            <ProjectSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : (
            <ProjectTable
              projects={projects}
              onOpen={handleOpen}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              pendingAction={pendingAction}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectTable({
  projects,
  onOpen,
  onDuplicate,
  onDelete,
  pendingAction,
}: {
  projects: ProjectSummary[];
  onOpen: (project: ProjectSummary) => void;
  onDuplicate: (projectId: string) => Promise<void> | void;
  onDelete: (projectId: string) => Promise<void> | void;
  pendingAction: { id: string; type: "duplicate" | "delete" } | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5">
      <table className="min-w-full divide-y divide-white/5 text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-white/60">
          <tr>
            <th className="px-6 py-4">Project</th>
            <th className="px-6 py-4">Flow</th>
            <th className="px-6 py-4">Persona</th>
            <th className="px-6 py-4">Rate</th>
            <th className="px-6 py-4">Updated</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projects.map((project) => {
            const busy = pendingAction?.id === project.id;
            const busyDuplicate = busy && pendingAction?.type === "duplicate";
            const busyDelete = busy && pendingAction?.type === "delete";
            return (
              <tr
                key={project.id}
                className="bg-white/0 transition hover:bg-white/5"
              >
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-white">
                        {project.title}
                      </span>
                      <BadgePill
                        label={formatStatus(project.status)}
                        tone="muted"
                      />
                    </div>
                    {project.notes ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {project.notes}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/70">
                        Snapshot includes full questionnaire answers.
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="text-sm">{formatFlow(project.flow)}</span>
                </td>
                <td className="px-6 py-5 align-top">
                  <span className="text-sm capitalize">
                    {project.persona ?? "—"}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  {project.hourlyRate ? (
                    <span className="text-sm font-medium text-white">
                      {formatRate(project.hourlyRate, project.currency)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-6 py-5 align-top text-sm text-muted-foreground">
                  {formatUpdatedAt(project.updatedAt)}
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      onClick={() => onOpen(project)}
                    >
                      <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white/80 hover:text-white"
                      onClick={() => onDuplicate(project.id)}
                      disabled={busyDuplicate}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      {busyDuplicate ? "Duplicating…" : "Duplicate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-300 hover:text-rose-200"
                      onClick={() => onDelete(project.id)}
                      disabled={busyDelete}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      {busyDelete ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={String(index)}
          className="h-16 w-full animate-pulse rounded-xl bg-white/5"
        />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-6 py-8 text-center text-sm text-amber-100">
      <p>{message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 border-white/30 text-white hover:bg-white/10"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
      <div className="rounded-full border border-white/10 bg-white/5 p-4">
        <FolderKanban className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-white">No saved projects yet</p>
        <p className="text-sm text-muted-foreground">
          Save a questionnaire to sync your deterministic scope, duplicate winning proposals,
          and resume client conversations in seconds.
        </p>
      </div>
      <div className="space-x-3">
        <Button asChild>
          <Link href="/questionnaire" className="gap-2">
            Launch questionnaire
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="text-white/80 hover:text-white"
          asChild
        >
          <Link href="/analysis">Analyze existing site</Link>
        </Button>
      </div>
    </div>
  );
}

function BadgePill({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "muted";
}) {
  const classes =
    tone === "primary"
      ? "border-white/30 text-white"
      : "border-white/15 text-white/70";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] uppercase tracking-[0.3em] ${classes}`}
    >
      {label}
    </span>
  );
}

function formatFlow(flow: ProjectSummary["flow"]) {
  return flow === "fresh" ? "Fresh build" : "Existing site";
}

function formatStatus(status: string) {
  if (!status) return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatRate(rate: number, currency: ProjectSummary["currency"]) {
  const currencyCode = currency.toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(rate);
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  return Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  }).format(date);
}

