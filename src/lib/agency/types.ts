export interface AgencyTeamMember {
  id: string;
  name: string;
  role: string;
  costRate: number;
  billableRate?: number;
  weeklyCapacity?: number;
  utilizationTarget?: number;
  color?: string;
}

export interface AgencyTeamSettings {
  targetMargin: number;
  desiredMarkup: number;
  notes?: string;
}

export interface AgencyTeamState extends AgencyTeamSettings {
  members: AgencyTeamMember[];
}

export interface AgencyRateSummary {
  blendedCostRate: number;
  recommendedBillableRate: number;
  margin: number;
  markup: number;
  totalWeeklyCapacity: number;
  memberCount: number;
  teamSnapshot: AgencyTeamMember[];
}


