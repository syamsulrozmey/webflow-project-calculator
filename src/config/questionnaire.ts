import type { LucideIcon } from "lucide-react";
import { CircuitBoard, Clock3, Layers3, Palette, PenTool } from "lucide-react";

export type QuestionnaireUserType = "freelancer" | "agency" | "company";
export type EntryFlow = "fresh" | "existing";

export type QuestionType =
  | "single"
  | "multi"
  | "scale"
  | "toggle"
  | "text";

export type QuestionnaireAnswer =
  | string
  | string[]
  | number
  | boolean
  | null
  | undefined;

export type VisibilityCondition =
  | { kind: "equals"; questionId: string; value: string | boolean }
  | { kind: "notEquals"; questionId: string; value: string | boolean }
  | { kind: "includes"; questionId: string; value: string };

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  recommendedFor?: QuestionnaireUserType[];
}

export interface QuestionDefinition {
  id: string;
  title: string;
  description?: string;
  helper?: string;
  tooltip?: string;
  type: QuestionType;
  required?: boolean;
  advanced?: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  visibleWhen?: VisibilityCondition[];
  defaultValue?: QuestionnaireAnswer;
  defaultsByUserType?: Partial<Record<QuestionnaireUserType, QuestionnaireAnswer>>;
}

export interface QuestionnaireSection {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  questions: QuestionDefinition[];
}

const userTypeDefaults = {
  freelancer: "freelancer",
  agency: "agency",
  company: "company",
} satisfies Record<QuestionnaireUserType, QuestionnaireUserType>;

export const questionnaireSections: QuestionnaireSection[] = [
  {
    id: "design",
    title: "Design Foundation",
    description:
      "Brand alignment, layouts, and motion depth for this engagement.",
    icon: Palette,
    badge: "Design",
    questions: [
      {
        id: "project_type",
        title: "What are you building or refreshing?",
        description:
          "This shapes the base hours before multipliers are applied.",
        type: "single",
        options: [
          {
            value: "landing",
            label: "Landing page / campaign",
            description: "1-3 sections, focused CTA, rapid turnaround",
            badge: "Fast",
            recommendedFor: [userTypeDefaults.freelancer],
          },
          {
            value: "marketing",
            label: "Marketing or small business site",
            description: "5-15 pages, CMS-enabled blog/resources",
            recommendedFor: [userTypeDefaults.agency],
          },
          {
            value: "commerce",
            label: "E-commerce storefront",
            description: "Catalog, checkout, transactional emails",
          },
          {
            value: "webapp",
            label: "Product / web application",
            description: "Authenticated areas, dashboards, integrations",
            badge: "Complex",
            recommendedFor: [userTypeDefaults.company],
          },
        ],
        defaultsByUserType: {
          freelancer: "landing",
          agency: "marketing",
          company: "webapp",
        },
      },
      {
        id: "design_depth",
        title: "How custom is the visual system?",
        type: "single",
        tooltip:
          "Consider whether you are adapting an existing design system or creating net-new art direction.",
        options: [
          { value: "template", label: "Template with light tweaks" },
          {
            value: "customized",
            label: "Customized library + bespoke sections",
          },
          {
            value: "net-new",
            label: "Net-new design system",
            description: "Bespoke layout, components, and states",
            badge: "High effort",
          },
        ],
        defaultValue: "customized",
      },
      {
        id: "brand_assets",
        title: "Which brand assets are ready?",
        type: "multi",
        helper: "Select all that apply.",
        options: [
          { value: "logo", label: "Logo + core brand colors" },
          { value: "typography", label: "Typography scale" },
          { value: "illustrations", label: "Illustration or 3D system" },
          { value: "none", label: "Need brand exploration" },
        ],
        defaultsByUserType: {
          freelancer: ["logo"],
          agency: ["logo", "typography"],
        },
      },
      {
        id: "motion_strategy",
        title: "Motion and interaction plan",
        type: "single",
        options: [
          { value: "minimal", label: "Minimal (nav hovers, reveals)" },
          {
            value: "standard",
            label: "Standard Webflow interactions",
            description: "Scroll reveals, parallax, sticky sections",
          },
          {
            value: "advanced",
            label: "Advanced motion/lottie/storytelling",
            badge: "Advanced",
          },
        ],
        defaultValue: "standard",
      },
      {
        id: "motion_complexity",
        title: "How many bespoke motion sequences?",
        description: "Think hero storytelling, scrollytelling, or 3D scenes.",
        type: "scale",
        min: 0,
        max: 8,
        step: 1,
        advanced: true,
        visibleWhen: [
          { kind: "notEquals", questionId: "motion_strategy", value: "minimal" },
        ],
      },
    ],
  },
  {
    id: "functionality",
    title: "Functionality & Systems",
    description: "Core features, CMS needs, and integrations.",
    icon: Layers3,
    badge: "Functionality",
    questions: [
      {
        id: "feature_stack",
        title: "Which functional areas are required?",
        type: "multi",
        helper: "Select everything that must be scoped.",
        options: [
          { value: "cms", label: "CMS collections" },
          { value: "forms", label: "Advanced forms / logic" },
          { value: "commerce", label: "E-commerce" },
          { value: "memberships", label: "Membership / gated content" },
          { value: "integrations", label: "External integrations" },
        ],
        defaultsByUserType: {
          freelancer: ["cms", "forms"],
          agency: ["cms", "forms", "integrations"],
          company: ["cms", "forms", "integrations", "memberships"],
        },
      },
      {
        id: "cms_collections",
        title: "How many CMS collections?",
        type: "scale",
        min: 0,
        max: 12,
        step: 1,
        visibleWhen: [{ kind: "includes", questionId: "feature_stack", value: "cms" }],
        helper: "Blog, resources, team, case studies, etc.",
      },
      {
        id: "commerce_catalog",
        title: "Catalog depth",
        type: "single",
        visibleWhen: [
          { kind: "includes", questionId: "feature_stack", value: "commerce" },
        ],
        options: [
          { value: "lite", label: "Under 25 SKUs" },
          { value: "standard", label: "25-200 SKUs" },
          { value: "enterprise", label: "200+ SKUs / variants" },
        ],
        advanced: true,
      },
      {
        id: "integration_targets",
        title: "Integration targets",
        type: "multi",
        advanced: true,
        options: [
          { value: "crm", label: "CRM (HubSpot, Salesforce)" },
          { value: "marketing", label: "Marketing automation" },
          { value: "analytics", label: "Analytics or CDP" },
          { value: "custom_api", label: "Custom API / middleware" },
        ],
        visibleWhen: [
          { kind: "includes", questionId: "feature_stack", value: "integrations" },
        ],
      },
      {
        id: "auth_requirements",
        title: "Do you need authenticated experiences?",
        type: "toggle",
        tooltip:
          "Covers simple password gates up to full memberships; influences build hours + hosting.",
        advanced: true,
      },
    ],
  },
  {
    id: "content",
    title: "Content & Localization",
    description: "Copywriting, imagery, and language scope.",
    icon: PenTool,
    badge: "Content",
    questions: [
      {
        id: "content_support",
        title: "How much content support do you need?",
        type: "single",
        options: [
          { value: "existing", label: "Existing content, light edits" },
          { value: "rewrite", label: "Rewrite existing pages" },
          { value: "net-new", label: "Net-new copy & content strategy" },
        ],
        defaultValue: "rewrite",
      },
      {
        id: "page_volume",
        title: "Roughly how many distinct pages or layouts?",
        type: "scale",
        min: 3,
        max: 40,
        step: 1,
        helper: "Unique layouts counted once even if reused.",
        defaultsByUserType: {
          freelancer: 6,
          agency: 12,
          company: 18,
        },
      },
      {
        id: "asset_needs",
        title: "Additional asset needs",
        type: "multi",
        options: [
          { value: "photo", label: "Custom photography" },
          { value: "video", label: "Video or motion graphics" },
          { value: "3d", label: "3D or complex illustration" },
          { value: "none", label: "No additional assets" },
        ],
        advanced: true,
      },
      {
        id: "localization",
        title: "Localization",
        type: "single",
        advanced: true,
        options: [
          { value: "single", label: "Single language" },
          { value: "dual", label: "2 languages" },
          { value: "multi", label: "3+ languages" },
        ],
      },
    ],
  },
  {
    id: "technical",
    title: "Technical & Compliance",
    description: "SEO, performance, hosting, and compliance requirements.",
    icon: CircuitBoard,
    badge: "Technical",
    questions: [
      {
        id: "hosting_strategy",
        title: "Hosting & deployment posture",
        type: "single",
        options: [
          { value: "webflow_core", label: "Webflow core hosting" },
          { value: "webflow_enterprise", label: "Webflow Enterprise" },
          { value: "hybrid", label: "Hybrid (reverse proxy / multi-host)" },
          { value: "custom_stack", label: "Custom stack / other CMS" },
        ],
        defaultValue: "webflow_core",
      },
      {
        id: "seo_support",
        title: "SEO support scope",
        type: "single",
        options: [
          { value: "baseline", label: "Baseline (meta, redirects)" },
          {
            value: "managed",
            label: "Managed (keyword briefs, schema)",
          },
          { value: "partner", label: "Partner-led (working with SEO team)" },
        ],
        defaultValue: "managed",
      },
      {
        id: "performance_targets",
        title: "Performance targets",
        type: "multi",
        helper: "Select targets that must be validated.",
        options: [
          { value: "lighthouse", label: "Lighthouse 90+ scores" },
          { value: "core_web_vitals", label: "Core Web Vitals pass" },
          { value: "accessibility", label: "WCAG AA audit" },
          { value: "security", label: "Security review / pen-test" },
        ],
      },
      {
        id: "security_posture",
        title: "Security posture expectations",
        type: "single",
        options: [
          { value: "standard", label: "Standard SSL + role-based access" },
          { value: "sso", label: "SSO / enforced MFA" },
          { value: "enterprise", label: "Enterprise review + pen-test" },
          { value: "regulated", label: "Regulated industry controls" },
        ],
        defaultValue: "standard",
        advanced: true,
      },
      {
        id: "compliance_needs",
        title: "Compliance frameworks",
        type: "multi",
        advanced: true,
        options: [
          { value: "hipaa", label: "HIPAA" },
          { value: "gdpr", label: "GDPR" },
          { value: "soc2", label: "SOC 2" },
          { value: "other", label: "Other / custom" },
        ],
      },
      {
        id: "accessibility_target",
        title: "Accessibility target",
        type: "single",
        options: [
          { value: "wcag_a", label: "WCAG A" },
          { value: "wcag_aa", label: "WCAG AA" },
          { value: "wcag_aaa", label: "WCAG AAA" },
          { value: "custom", label: "Custom accessibility plan" },
        ],
        defaultValue: "wcag_aa",
        advanced: true,
      },
      {
        id: "browser_support",
        title: "Browser & device support",
        type: "multi",
        helper: "Select any requirements beyond evergreen browsers.",
        options: [
          { value: "legacy_safari", label: "Legacy Safari / iOS 14" },
          { value: "ie_mode", label: "IE mode / legacy Edge" },
          { value: "android_low", label: "Low-end Android devices" },
          { value: "desktop_kiosk", label: "Desktop kiosks / large displays" },
        ],
        advanced: true,
      },
      {
        id: "hosting_notes",
        title: "Hosting preferences or constraints",
        type: "text",
        placeholder: "e.g. Webflow Enterprise, reverse proxy, custom domains",
        advanced: true,
      },
    ],
  },
  {
    id: "timeline",
    title: "Timeline & Post-launch",
    description: "Launch urgency, approvals, and maintenance.",
    icon: Clock3,
    badge: "Timeline",
    questions: [
      {
        id: "hourly_rate",
        title: "What hourly rate should drive this estimate?",
        description: "You can tweak margin later, but start with your typical blended rate.",
        type: "scale",
        min: 40,
        max: 250,
        step: 5,
        defaultsByUserType: {
          freelancer: 85,
          agency: 135,
          company: 110,
        },
      },
      {
        id: "rate_currency",
        title: "Which currency do you price in?",
        type: "single",
        options: [
          { value: "usd", label: "US Dollar (USD)" },
          { value: "eur", label: "Euro (EUR)" },
          { value: "gbp", label: "British Pound (GBP)" },
        ],
        defaultValue: "usd",
        helper: "Affects how totals and future exports are formatted.",
      },
      {
        id: "timeline_urgency",
        title: "Target launch window",
        type: "single",
        options: [
          { value: "relaxed", label: "Flexible / ASAP" },
          { value: "standard", label: "4-8 weeks" },
          { value: "rush", label: "Need rush delivery (<4 weeks)" },
          { value: "critical", label: "Non-negotiable launch date" },
        ],
        defaultValue: "standard",
      },
      {
        id: "deadline_confidence",
        title: "How firm is that launch date?",
        description: "Clarify slip tolerance so we can plan contingency buffers.",
        type: "single",
        options: [
          { value: "fixed", label: "Fixed go-live date" },
          { value: "target_window", label: "Target month/quarter" },
          { value: "flexible", label: "Flexible, milestone-driven" },
        ],
        defaultValue: "target_window",
      },
      {
        id: "review_cycles",
        title: "Expected stakeholder review cycles",
        type: "scale",
        min: 1,
        max: 6,
        step: 1,
        helper: "Count full review + feedback loops needed before launch.",
        defaultsByUserType: {
          freelancer: 2,
          agency: 3,
          company: 4,
        },
      },
      {
        id: "stakeholders",
        title: "How many stakeholder approvers?",
        type: "scale",
        min: 1,
        max: 8,
        step: 1,
        helper: "Includes marketing, product, leadership, legal, etc.",
        defaultsByUserType: {
          freelancer: 2,
          agency: 3,
          company: 5,
        },
      },
      {
        id: "maintenance_plan",
        title: "Post-launch maintenance preference",
        description:
          "Maintenance retains security/uptime coverage; roadmap or feature pushes should live in scoped projects.",
        type: "single",
        helper: "Choose the duration/commitment level for true upkeep support.",
        options: [
          { value: "handoff", label: "One-time handoff" },
          { value: "support", label: "Support for 1-3 months" },
          { value: "retainer", label: "Ongoing retainer (6+ months)" },
        ],
        defaultValue: "support",
      },
      {
        id: "maintenance_cadence",
        title: "How often should updates happen?",
        type: "single",
        helper: "Think content refreshes, CMS tweaks, or feature iterations.",
        options: [
          { value: "ad_hoc", label: "Ad-hoc / as requested" },
          { value: "monthly", label: "Monthly iteration cycle" },
          { value: "quarterly", label: "Quarterly refresh" },
          { value: "weekly", label: "Weekly or sprint-based" },
        ],
        defaultValue: "monthly",
      },
      {
        id: "maintenance_owner",
        title: "Who owns maintenance?",
        type: "single",
        options: [
          { value: "client_team", label: "Client team handles updates" },
          { value: "shared", label: "Shared responsibility" },
          { value: "provider", label: "Our team maintains everything" },
        ],
        helper: "Provider-owned retainer implies you own uptime, monitoring, and emergency fixes.",
        defaultValue: "shared",
      },
      {
        id: "maintenance_scope",
        title: "What should maintenance actually cover?",
        description: "Clarify if you only need upkeep or if you're trying to include feature iterations.",
        type: "single",
        options: [
          {
            value: "core",
            label: "Core upkeep & monitoring",
            description: "Security patches, uptime checks, bug fixes.",
          },
          {
            value: "content_ops",
            label: "Content + SEO refresh",
            description: "Monthly page tweaks, landing page swaps, CMS edits.",
          },
          {
            value: "feature_sprints",
            label: "Feature iterations / roadmap",
            description: "Net-new sections, experiments, sprints.",
            badge: "Scope to projects",
          },
        ],
        defaultValue: "core",
      },
      {
        id: "maintenance_hours_target",
        title: "How many hours per month should the retainer include?",
        type: "scale",
        min: 4,
        max: 40,
        step: 2,
        helper: "Use your best estimate—we’ll benchmark against market data.",
        advanced: true,
      },
      {
        id: "maintenance_sla",
        title: "Support SLA expectations",
        type: "single",
        advanced: true,
        options: [
          { value: "business_hours", label: "Business hours response" },
          { value: "next_business_day", label: "Next business day turnaround" },
          { value: "twentyfour_seven", label: "24/7 on-call support" },
        ],
      },
      {
        id: "training_needs",
        title: "Training & enablement",
        type: "multi",
        advanced: true,
        options: [
          { value: "editor", label: "Webflow Editor onboarding" },
          { value: "dev", label: "Development handoff" },
          { value: "playbooks", label: "Custom playbooks / docs" },
        ],
      },
    ],
  },
];

