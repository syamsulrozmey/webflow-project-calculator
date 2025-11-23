import { Bot, Calculator, FileChartColumn, ShieldCheck } from "lucide-react";

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
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-b border-white/5 bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-10 space-y-4 text-center">
          <p className="text-sm text-primary">
            Why Teams Choose It
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Scoped for Webflow’s unique reality.
          </h2>
          <p className="text-base text-muted-foreground">
            Built from the PRD’s feature set: multi-flow entry, crawler/AI
            insights, pro exports, and benchmark intelligence.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="h-full border-white/5 bg-card/70 backdrop-blur"
            >
              <CardHeader className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

