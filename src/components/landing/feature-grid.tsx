import { Bot, Calculator, FileChartColumn, ShieldCheck, Layers, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Deterministic Engine",
    description:
      "Base hours, multipliers, and timeline logic ensure defendable estimates before AI adds nuance.",
    icon: Calculator,
  },
  {
    title: "Crawler Intelligence",
    description:
      "Firecrawl surfaces CMS collections, animations, and migration effort from live URLs in seconds.",
    icon: Bot,
  },
  {
    title: "Professional Outputs",
    description:
      "Generate PDF/CSV reports with phased roadmaps, risks, benchmarking, and ready-to-send narrative.",
    icon: FileChartColumn,
  },
  {
    title: "Risk Controls",
    description:
      "Rate limiting, caching, and validation keep the API resilient even under heavy usage.",
    icon: ShieldCheck,
  },
  {
    title: "Component Library",
    description: "Map identified structures to your agency's component library for precise costing.",
    icon: Layers
  },
  {
    title: "Instant Export",
    description: "One-click export to your proposal software or project management tool.",
    icon: Zap
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-conversion-border-light bg-conversion-beige py-24">
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="mb-16 space-y-6 text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl font-medium text-conversion-charcoal md:text-5xl tracking-tight">
            Scoped for Webflow’s unique reality.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Built from the PRD’s feature set: multi-flow entry, crawler/AI
            insights, pro exports, and benchmark intelligence.
          </p>
        </div>
        <div className="grid gap-px bg-conversion-border-light overflow-hidden rounded-2xl border border-conversion-border-light sm:grid-cols-2 lg:grid-cols-3 shadow-sm">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group relative bg-white p-10 hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="space-y-6 relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-conversion-beige border border-conversion-border-light text-conversion-charcoal group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl text-conversion-charcoal">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
