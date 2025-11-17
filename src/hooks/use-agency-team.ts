"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { loadAgencyState, persistAgencyState } from "@/lib/agency/storage";
import { summarizeAgencyRates } from "@/lib/agency/rates";
import type {
  AgencyRateSummary,
  AgencyTeamMember,
  AgencyTeamState,
} from "@/lib/agency/types";

const DEFAULT_MEMBERS: AgencyTeamMember[] = [
  {
    id: "designer",
    name: "Lead Designer",
    role: "Design",
    costRate: 55,
    billableRate: 125,
    weeklyCapacity: 30,
  },
  {
    id: "developer",
    name: "Webflow Dev",
    role: "Development",
    costRate: 65,
    billableRate: 140,
    weeklyCapacity: 35,
  },
  {
    id: "pm",
    name: "Producer",
    role: "PM/Ops",
    costRate: 45,
    billableRate: 110,
    weeklyCapacity: 20,
  },
];

const DEFAULT_STATE: AgencyTeamState = {
  members: DEFAULT_MEMBERS,
  targetMargin: 0.35,
  desiredMarkup: 0.45,
};

export function useAgencyTeamConfig(sessionId?: string | null) {
  const [state, setState] = useState<AgencyTeamState>(DEFAULT_STATE);
  const [loadedSession, setLoadedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || loadedSession === sessionId) return;
    const nextState = loadAgencyState(sessionId) ?? DEFAULT_STATE;
    const frame = window.requestAnimationFrame(() => {
      setState(nextState);
      setLoadedSession(sessionId);
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [sessionId, loadedSession]);

  const upsertMember = useCallback((member: AgencyTeamMember) => {
    setState((prev) => {
      const existingIndex = prev.members.findIndex((item) => item.id === member.id);
      const members =
        existingIndex === -1
          ? [...prev.members, member]
          : prev.members.map((item, index) => (index === existingIndex ? member : item));
      const next = { ...prev, members };
      persistAgencyState(sessionId ?? null, next);
      return next;
    });
  }, [sessionId]);

  const removeMember = useCallback((id: string) => {
    setState((prev) => {
      const members = prev.members.filter((member) => member.id !== id);
      const next = { ...prev, members };
      persistAgencyState(sessionId ?? null, next);
      return next;
    });
  }, [sessionId]);

  const updateSettings = useCallback(
    (partial: Partial<Omit<AgencyTeamState, "members">>) => {
      setState((prev) => {
        const next = { ...prev, ...partial };
        persistAgencyState(sessionId ?? null, next);
        return next;
      });
    },
    [sessionId],
  );

  const resetState = useCallback(() => {
    setState(DEFAULT_STATE);
    persistAgencyState(sessionId ?? null, DEFAULT_STATE);
  }, [sessionId]);

  const summary: AgencyRateSummary = useMemo(
    () => summarizeAgencyRates(state),
    [state],
  );

  return {
    state,
    summary,
    upsertMember,
    removeMember,
    updateSettings,
    resetState,
  };
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `member_${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlankMember(role = "Specialist"): AgencyTeamMember {
  return {
    id: generateId(),
    name: "",
    role,
    costRate: 60,
    billableRate: 130,
    weeklyCapacity: 30,
  };
}


