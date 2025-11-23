export interface PaymentMilestone {
  id: string;
  label: string;
  percent: number;
  note: string;
}

export interface PaymentPlan {
  id: string;
  label: string;
  narrative: string;
  milestones: PaymentMilestone[];
}

const PAYMENT_PLANS: Array<{ id: string; label: string; maxTotal: number; narrative: string; milestones: PaymentMilestone[] }> = [
  {
    id: "small",
    label: "50/50 milestone",
    maxTotal: 6000,
    narrative: "Ideal for lean scopes or solopreneur budgets. Collect half upfront, half on launch.",
    milestones: [
      { id: "deposit", label: "Kickoff deposit", percent: 0.5, note: "Due at contract signature" },
      { id: "launch", label: "Pre-launch balance", percent: 0.5, note: "Due before final handoff" },
    ],
  },
  {
    id: "mid",
    label: "33/33/34 milestone",
    maxTotal: 18000,
    narrative: "Matches the $8k-$15k professional tier. Align payouts with design + dev checkpoints.",
    milestones: [
      { id: "deposit", label: "Deposit", percent: 0.33, note: "Before discovery/design" },
      { id: "design", label: "Design approval", percent: 0.33, note: "Due at signed design/comps" },
      { id: "prelaunch", label: "Pre-launch", percent: 0.34, note: "Before site goes live" },
    ],
  },
  {
    id: "large",
    label: "25% x4 milestone",
    maxTotal: Number.POSITIVE_INFINITY,
    narrative: "For premium engagements or enterprise work, split into four equal checkpoints.",
    milestones: [
      { id: "deposit", label: "Deposit", percent: 0.25, note: "Project kickoff" },
      { id: "design", label: "Design sign-off", percent: 0.25, note: "High-fidelity approval" },
      { id: "development", label: "Development milestone", percent: 0.25, note: "Feature-complete build" },
      { id: "launch", label: "Launch & warranty", percent: 0.25, note: "Pre-launch / warranty period" },
    ],
  },
];

export function selectPaymentPlan(totalCost: number): PaymentPlan {
  const plan = PAYMENT_PLANS.find((entry) => totalCost <= entry.maxTotal) ?? PAYMENT_PLANS[PAYMENT_PLANS.length - 1];
  return {
    id: plan.id,
    label: plan.label,
    narrative: plan.narrative,
    milestones: plan.milestones,
  };
}


