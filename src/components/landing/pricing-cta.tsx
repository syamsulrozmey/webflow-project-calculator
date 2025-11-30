import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    title: "Free",
    price: "$0",
    description: "Everything you need to scope Webflow projects accurately. No credit card required.",
    bullets: [
      "Unlimited project estimates",
      "Full calculation engine",
      "Basic PDF exports (watermarked)",
      "3 site analyses per month",
    ],
    cta: "Start Free",
    variant: "outline" as const
  },
  {
    title: "Pro",
    price: "$15",
    period: "/mo",
    description: "For Webflow agencies ready to close more deals with professional proposals.",
    bullets: [
      "Custom-branded PDF exports",
      "Unlimited site analysis",
      "Save & manage all projects",
      "Advanced benchmarks",
      "Priority support",
    ],
    highlight: true,
    cta: "Upgrade to Pro",
    variant: "default" as const
  },
];

export function PricingCTA() {
  return (
    <section id="pricing" className="relative bg-conv-section-mint py-24 overflow-hidden">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left Content */}
          <div className="space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-conv-text-primary tracking-tight">
              Stop undercharging.<br />Start scoping smarter.
            </h2>
            <p className="text-lg text-conv-text-secondary leading-relaxed">
              Free forever for unlimited estimates. Upgrade to Pro when you need polished proposals with custom branding that close deals faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full bg-conv-primary px-8 h-12 text-base text-white hover:bg-conv-primary-hover shadow-button hover:shadow-button-hover transition-all duration-200 hover:-translate-y-0.5" 
                asChild
              >
                <Link href="/onboarding" className="flex items-center gap-2">
                  Create Your First Estimate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                className="rounded-full h-12 px-8 text-base text-conv-text-secondary hover:text-conv-text-primary hover:bg-white" 
                asChild
              >
                <Link href="#features">See All Features</Link>
              </Button>
            </div>
          </div>

          {/* Right - Pricing Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                  tier.highlight 
                    ? "border-conv-primary bg-white shadow-card-elevated scale-105 z-10" 
                    : "border-conv-border bg-white/80 hover:bg-white hover:shadow-card-hover"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-conv-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-button">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-conv-text-primary mb-2">{tier.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-medium text-conv-text-primary">{tier.price}</span>
                    {tier.period && <span className="text-conv-text-muted">{tier.period}</span>}
                  </div>
                  <p className="mt-4 text-sm text-conv-text-secondary leading-relaxed">{tier.description}</p>
                </div>

                <ul className="mb-8 space-y-4 flex-1">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-conv-text-primary">
                      <Check className={`h-5 w-5 shrink-0 ${tier.highlight ? 'text-conv-primary' : 'text-conv-text-muted'}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl h-12 transition-all duration-200 ${
                    tier.highlight 
                      ? 'bg-conv-primary hover:bg-conv-primary-hover text-white shadow-button hover:shadow-button-hover' 
                      : 'bg-white border border-conv-border text-conv-text-primary hover:bg-conv-background hover:border-conv-text-muted'
                  }`}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
