import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  {
    title: "Free",
    price: "$0",
    description: "Unlimited calculations, watermarked exports, 3 crawls/month.",
    bullets: [
      "Deterministic engine access",
      "Basic PDF export",
      "Industry benchmarks (global)",
    ],
  },
  {
    title: "Pro",
    price: "$15/mo",
    description: "Client-ready exports, advanced benchmarks, unlimited crawls.",
    bullets: [
      "Custom-branded PDF/CSV",
      "Advanced Firecrawl insights",
      "Save/manage multiple projects",
      "Team collaboration",
    ],
    highlight: true,
  },
];

export function PricingCTA() {
  return (
    <section id="pricing" className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-primary">
            Launch Timeline: Phase 5
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Start free, upgrade when you need client-ready outputs.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.title}
              className={`h-full border-white/5 ${
                tier.highlight ? "bg-primary/10" : "bg-card/70"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {tier.title}
                  {tier.highlight && (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Coming Phase 5
                    </span>
                  )}
                </CardTitle>
                <div className="text-3xl font-bold text-foreground">
                  {tier.price}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlight ? "default" : "outline"}
                  className="w-full"
                >
                  {tier.highlight ? "Join waitlist" : "Start calculating"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

