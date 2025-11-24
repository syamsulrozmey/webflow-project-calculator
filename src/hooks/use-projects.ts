"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  ProjectDetail,
  ProjectRequestPayload,
  ProjectSummary,
} from "@/lib/projects/types";

interface ApiEnvelope<T> {
  data?: T;
  error?: string;
}

interface UseProjectsOptions {
  autoFetch?: boolean;
}

export function useProjects(options?: UseProjectsOptions) {
  const autoFetch = options?.autoFetch ?? true;
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      const data = await resolveResponse<ProjectSummary[]>(response, "Unable to load projects");
      setProjects(data);
    } catch (err) {
      setProjects([]);
      setError(err instanceof Error ? err.message : "Unable to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    void refresh();
  }, [autoFetch, refresh]);

  const fetchProjectDetail = useCallback(async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
    return resolveResponse<ProjectDetail>(
      response,
      "Unable to fetch this project right now.",
    );
  }, []);

  const createProject = useCallback(async (payload: ProjectRequestPayload) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const detail = await resolveResponse<ProjectDetail>(
      response,
      "Unable to create project.",
    );
    setProjects((prev) => [summarize(detail), ...prev]);
    return detail;
  }, []);

  const updateProject = useCallback(
    async (projectId: string, payload: ProjectRequestPayload) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const detail = await resolveResponse<ProjectDetail>(
        response,
        "Unable to update project.",
      );
      setProjects((prev) =>
        prev.map((project) => (project.id === projectId ? summarize(detail) : project)),
      );
      return detail;
    },
    [],
  );

  const deleteProjectById = useCallback(async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const payload = await parseEnvelope(response);
      throw new Error(payload.error ?? "Unable to delete project.");
    }
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  }, []);

  const duplicateProject = useCallback(async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}/duplicate`, {
      method: "POST",
    });
    const detail = await resolveResponse<ProjectDetail>(
      response,
      "Unable to duplicate project.",
    );
    setProjects((prev) => [summarize(detail), ...prev]);
    return detail;
  }, []);

  return {
    projects,
    loading,
    error,
    refresh,
    fetchProjectDetail,
    createProject,
    updateProject,
    deleteProject: deleteProjectById,
    duplicateProject,
  };
}

async function resolveResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const payload = await parseEnvelope<T>(response);
  if (!response.ok) {
    throw new Error(payload.error ?? fallback);
  }
  if (payload.data === undefined) {
    throw new Error(fallback);
  }
  return payload.data;
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as ApiEnvelope<T>;
  } catch {
    return {};
  }
}

function summarize(detail: ProjectDetail): ProjectSummary {
  const { answers: _answers, ...summary } = detail;
  void _answers;
  return summary;
}
