import { LandingFooter } from "@/components/landing/footer";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HeroSection } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/navigation";
import { PricingCTA } from "@/components/landing/pricing-cta";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { WorkflowSection } from "@/components/landing/workflow";

export default function Home() {
  return (
    <main className="bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <TestimonialsSection />
      <PricingCTA />
      <LandingFooter />
    </main>
  );
}
