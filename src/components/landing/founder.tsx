import { Quote } from "lucide-react";
import Image from "next/image";

export function FounderSection() {
  return (
    <section className="relative bg-white py-24 overflow-hidden">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative">
                <div className="h-40 w-36 md:h-52 md:w-44 rounded-2xl bg-gradient-to-br from-conv-section-mint to-conv-section-sage border border-conv-border overflow-hidden shadow-card relative">
                  <Image 
                    src="/assets/FLORA-Portrait Swap-0797a2e45.png" 
                    alt="Sam Rozmey" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                {/* Years Badge */}
                <div className="absolute -bottom-3 -right-3 bg-conv-text-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-card-elevated">
                  8 years in Webflow
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 flex-1">
              <div className="flex items-center gap-2.5 text-conv-primary">
                <Quote className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">From the founder</span>
              </div>
              
              <blockquote className="font-serif text-2xl md:text-3xl text-conv-text-primary leading-relaxed">
                I got tired of spending hours on estimates, missing line items, and never being consistent with pricing across projects.
              </blockquote>
              
              <p className="text-conv-text-secondary text-lg leading-relaxed">
                After 8 years of building Webflow sites—first as a freelancer, then as COO at a marketing agency—I built FlowScope to fix the quoting process I always hated. No more spreadsheets. No more guesswork. Just accurate estimates you can actually stand behind.
              </p>

              <div className="flex items-center gap-4 pt-4">
                <div className="h-px flex-1 bg-conv-border-light"></div>
                <div className="text-right">
                  <div className="font-semibold text-conv-text-primary">Sam Rozmey</div>
                  <div className="text-sm text-conv-text-muted">Founder, FlowScope</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
