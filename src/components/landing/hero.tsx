import Link from "next/link";

import { Button } from "@/components/ui/button";

const sellingPoints = [
  "Two entry flows: fresh builds + site migrations",
  "Deterministic engine backed by benchmark data",
  "Crawler + AI insights with graceful fallbacks",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-background via-background to-[#0b1021]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 md:px-10 lg:px-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.4em] text-primary">
            Webflow Estimation OS
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Quote Webflow projects with{" "}
            <span className="text-primary">confidence</span> in minutes.
          </h1>
          <p className="text-lg text-muted-foreground">
            Feed in questionnaire answers or crawl an existing site. The
            calculator blends deterministic hours with crawler intelligence and
            benchmark data—no AI guesswork required.
          </p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/onboarding?entry=fresh">Start fresh project flow</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/20 sm:w-auto"
              asChild
            >
              <Link href="/onboarding?entry=existing">
                Analyze existing site
              </Link>
            </Button>
          </div>
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {sellingPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="rounded-3xl border border-primary/20 bg-card/70 p-6 shadow-soft-card backdrop-blur">
            <div className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Deterministic Engine
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-background/60 px-4 py-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">
                    Fresh Project
                  </p>
                  <p className="text-base text-foreground">
                    Small Business · Standard
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">$18,450</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-background/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Breakdown
                </p>
                <div className="mt-3 grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Discovery & Strategy</span>
                    <span>12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Design & UX</span>
                    <span>24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Development & Integrations</span>
                    <span>34%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-background/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">
                  Multipliers Applied
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {["Design: 1.35×", "Features: 1.2×", "Content: 1.15×", "Timeline: 1.1×"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 px-3 py-1"
                      >
                        {tag}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

