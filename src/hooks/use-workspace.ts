"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { useProjects } from "@/hooks/use-projects";
import { getFeatureTier, isFreeTier, type FeatureTier } from "@/lib/export/feature-tier";
import { loadCalculationResult } from "@/lib/calculator/storage";

type UsageSnapshot = {
  crawlsUsed: number;
  crawlsLimit: number;
  exportsUsed: number;
  exportsLimit: number;
};

// Mock user until Clerk is installed & configured
const mockUser = {
  fullName: "Alex Designer",
  primaryEmailAddress: { emailAddress: "alex@webflowpro.com" },
  imageUrl: "",
};

export function useWorkspace() {
  // Replace with useUser() from @clerk/nextjs once installed
  const user = mockUser;
  const isLoaded = true;
  const pathname = usePathname();
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refresh: refreshProjects,
  } = useProjects();

  const tier: FeatureTier = getFeatureTier();
  const calculation = loadCalculationResult();

  // For now we simulate usage; replace with real API once available.
  const usage = useMemo<UsageSnapshot>(() => {
    const crawlsLimit = isFreeTier(tier) ? 5 : 50;
    const exportsLimit = isFreeTier(tier) ? 3 : 100;
    return {
      crawlsUsed: Math.min(2, crawlsLimit),
      exportsUsed: Math.min(1, exportsLimit),
      crawlsLimit,
      exportsLimit,
    };
  }, [tier]);

  const resumeProjectId = useMemo(() => {
    if (projects.length === 0) return null;
    return projects[0]?.id ?? null;
  }, [projects]);

  const workspaceUser = useMemo(
    () => ({
      name: user.fullName,
      email: user.primaryEmailAddress.emailAddress,
      avatarUrl: user.imageUrl,
      userType: "agency" as const,
      isLoaded,
    }),
    [user, isLoaded],
  );

  const routeContext = useMemo(
    () => ({
      pathname,
      isDashboard: pathname?.startsWith("/dashboard") ?? false,
      isProjects: pathname?.startsWith("/projects") ?? false,
      isAnalysis: pathname?.startsWith("/analysis") ?? false,
      isResults: pathname?.startsWith("/results") ?? false,
    }),
    [pathname],
  );

  return {
    tier,
    usage,
    projects,
    projectsLoading,
    projectsError,
    refreshProjects,
    resumeProjectId,
    calculation,
    user: workspaceUser,
    routeContext,
  };
}


