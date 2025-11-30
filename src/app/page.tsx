import { LandingFooter } from "@/components/landing/footer";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { FounderSection } from "@/components/landing/founder";
import { HeroSection } from "@/components/landing/hero";
import { LandingNav } from "@/components/landing/navigation";
import { PricingCTA } from "@/components/landing/pricing-cta";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { WorkflowSection } from "@/components/landing/workflow";

export default function Home() {
  return (
    <main className="min-h-screen bg-conv-background text-conv-text-primary">
      <LandingNav />
      <HeroSection />
      <FeatureGrid />
      <WorkflowSection />
      <TestimonialsSection />
      <FounderSection />
      <PricingCTA />
      <LandingFooter />
    </main>
  );
}
