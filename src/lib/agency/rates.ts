import type { AgencyRateSummary, AgencyTeamMember, AgencyTeamState } from "@/lib/agency/types";

const FALLBACK_CAPACITY = 30;

function ensureCapacity(member: AgencyTeamMember): number {
  if (typeof member.weeklyCapacity === "number" && member.weeklyCapacity > 0) {
    return member.weeklyCapacity;
  }
  return FALLBACK_CAPACITY;
}

export function calculateBlendedCostRate(state: AgencyTeamState): number {
  if (!state.members.length) {
    return 0;
  }

  const { totalCapacity, weightedCost } = state.members.reduce(
    (acc, member) => {
      const capacity = ensureCapacity(member);
      const costRate = Number(member.costRate) || 0;
      return {
        totalCapacity: acc.totalCapacity + capacity,
        weightedCost: acc.weightedCost + costRate * capacity,
      };
    },
    { totalCapacity: 0, weightedCost: 0 },
  );

  if (totalCapacity === 0) {
    const avgCost =
      state.members.reduce((sum, member) => sum + (Number(member.costRate) || 0), 0) /
      state.members.length;
    return Number.isFinite(avgCost) ? Number(avgCost.toFixed(2)) : 0;
  }

  return Number((weightedCost / totalCapacity).toFixed(2));
}

export function calculateRecommendedBillableRate(
  blendedCost: number,
  targetMargin: number,
  desiredMarkup?: number,
): number {
  if (blendedCost <= 0) return 0;
  const margin = clampMargin(targetMargin);
  const markup = desiredMarkup ? Math.max(margin, desiredMarkup) : margin;
  const grossRate = blendedCost / (1 - margin);
  const markedUp = grossRate * (1 + markup - margin);
  return Number(markedUp.toFixed(2));
}

export function summarizeAgencyRates(state: AgencyTeamState): AgencyRateSummary {
  const blendedCostRate = calculateBlendedCostRate(state);
  const recommendedBillableRate = calculateRecommendedBillableRate(
    blendedCostRate,
    state.targetMargin,
    state.desiredMarkup,
  );
  const totalWeeklyCapacity = state.members.reduce(
    (sum, member) => sum + ensureCapacity(member),
    0,
  );

  return {
    blendedCostRate,
    recommendedBillableRate,
    margin: clampMargin(state.targetMargin),
    markup: clampMargin(state.desiredMarkup),
    totalWeeklyCapacity,
    memberCount: state.members.length,
    teamSnapshot: state.members,
  };
}

function clampMargin(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.3;
  }
  return Math.min(0.8, Math.max(0.05, Number(value)));
}


