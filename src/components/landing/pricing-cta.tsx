import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    cta: "Start calculating",
    variant: "outline"
  },
  {
    title: "Pro",
    price: "$15",
    period: "/mo",
    description: "Client-ready exports, advanced benchmarks, unlimited crawls.",
    bullets: [
      "Custom-branded PDF/CSV",
      "Advanced Firecrawl insights",
      "Save/manage multiple projects",
      "Team collaboration",
    ],
    highlight: true,
    cta: "Join waitlist",
    variant: "default"
  },
];

export function PricingCTA() {
  return (
    <section id="pricing" className="border-b border-conversion-border-light bg-white py-24">
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          <div className="space-y-8">
            <h2 className="font-serif text-4xl font-medium text-conversion-charcoal md:text-5xl tracking-tight">
              Start free, upgrade when you need client-ready outputs.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Our Free tier gives you the full calculation engine. Upgrade to Pro to remove watermarks and unlock deep crawler insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="rounded-full bg-conversion-charcoal px-8 h-12 text-base hover:bg-black transition-transform hover:-translate-y-1" asChild>
                <Link href="/onboarding">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full h-12 px-8 text-base hover:bg-gray-100" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.title}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                  tier.highlight 
                    ? "border-conversion-green bg-white shadow-xl scale-105 z-10" 
                    : "border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-lg"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-conversion-green text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-conversion-charcoal mb-2">{tier.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-medium text-conversion-charcoal">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                </div>

                <ul className="mb-8 space-y-4 flex-1">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm text-conversion-charcoal">
                      <Check className={`h-5 w-5 shrink-0 ${tier.highlight ? 'text-conversion-green' : 'text-gray-400'}`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full rounded-xl h-12 ${
                    tier.highlight 
                      ? 'bg-conversion-green hover:bg-conversion-green/90 text-white shadow-md hover:shadow-lg' 
                      : 'bg-white border border-gray-200 text-conversion-charcoal hover:bg-gray-50'
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
