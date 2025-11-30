import { ArrowRight, FileText, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative bg-white py-24 overflow-hidden">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-medium text-conv-primary uppercase tracking-wider mb-4">
            Two Ways to Scope
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-conv-text-primary tracking-tight">
            Fresh build or migration? Start anywhere.
          </h2>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          
          {/* Flow 1: Fresh Project */}
          <div className="group relative bg-white rounded-3xl border border-conv-border p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            {/* Illustration Area */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-conv-section-mint">
              <div className="absolute inset-0 bg-dot-pattern opacity-40"></div>
              
              {/* Floating Card - Questionnaire */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 rounded-xl bg-white shadow-card-elevated border border-conv-border-light p-5 transition-transform duration-500 group-hover:scale-105">
                <div className="mb-4 flex items-center justify-between border-b border-conv-border-light pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-1.5 w-12 rounded-full bg-conv-background overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-conv-purple animate-progress-grow"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        i === 1 ? 'bg-conv-purple border-conv-purple' : 'border-conv-border'
                      }`}>
                        {i === 1 && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div className="h-2.5 flex-1 rounded bg-conv-background"></div>
                    </div>
                  ))}
                </div>
                
                {/* Result Badge */}
                <div className="absolute -right-3 -bottom-3 rounded-xl bg-conv-text-primary px-4 py-2.5 text-white shadow-card-elevated">
                  <div className="text-[10px] opacity-70 uppercase tracking-wide">Estimate</div>
                  <div className="text-lg font-semibold">$12,500</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-conv-purple/10 text-conv-purple">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl text-conv-text-primary">New Build Questionnaire</h3>
              </div>
              <p className="text-conv-text-secondary leading-relaxed">
                Starting from scratch? Answer targeted questions about pages, CMS complexity, interactions, and integrations to get a detailed scope your client will trust.
              </p>
              <ul className="space-y-3 text-sm">
                 <li className="flex items-center gap-2.5 text-conv-text-primary">
                   <CheckCircle2 className="h-4.5 w-4.5 text-conv-purple" />
                   <span>Smart questions adapt to your answers</span>
                 </li>
                 <li className="flex items-center gap-2.5 text-conv-text-primary">
                   <CheckCircle2 className="h-4.5 w-4.5 text-conv-purple" />
                   <span>Phase-by-phase hour breakdown</span>
                 </li>
              </ul>
              <Button 
                variant="link" 
                className="p-0 h-auto text-conv-purple hover:text-conv-purple/80 font-medium group/btn" 
                asChild
              >
                <Link href="/onboarding?entry=fresh" className="flex items-center gap-1.5">
                  Start new estimate 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Flow 2: Existing Site */}
          <div className="group relative bg-white rounded-3xl border border-conv-border p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
            {/* Illustration Area */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-conv-section-sage">
              <div className="absolute inset-0 bg-dot-pattern opacity-40"></div>
              
              {/* Browser Window - Scanner */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 overflow-hidden rounded-xl bg-white shadow-card-elevated border border-conv-border-light transition-transform duration-500 group-hover:scale-105">
                <div className="bg-conv-background px-3 py-2.5 border-b border-conv-border-light flex items-center gap-2">
                   <div className="flex items-center gap-1.5">
                     <div className="h-2.5 w-2.5 rounded-full bg-red-400/60"></div>
                     <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60"></div>
                     <div className="h-2.5 w-2.5 rounded-full bg-green-400/60"></div>
                   </div>
                   <div className="flex-1 h-5 rounded-md bg-white border border-conv-border-light text-[9px] flex items-center px-2.5 text-conv-text-muted">
                     example.com
                   </div>
                </div>
                <div className="p-4 relative h-32 bg-white">
                   {/* Website Mock Content */}
                   <div className="space-y-2.5">
                      <div className="h-8 w-full rounded-lg bg-conv-background"></div>
                      <div className="flex gap-2">
                         <div className="h-12 w-1/3 rounded-lg bg-conv-background"></div>
                         <div className="h-12 w-2/3 rounded-lg bg-conv-background"></div>
                      </div>
                      <div className="h-16 w-full rounded-lg bg-conv-background/50 border border-dashed border-conv-border"></div>
                   </div>

                   {/* Scanner Overlay */}
                   <div className="absolute left-0 right-0 h-0.5 bg-conv-primary shadow-[0_0_10px_rgba(58,139,140,0.8)] animate-scan z-10 top-0"></div>
                   
                   {/* Detected Tags */}
                   <div className="absolute top-10 right-2 bg-conv-primary text-white text-[9px] font-medium px-2 py-1 rounded-md animate-fade-up">CMS</div>
                   <div className="absolute bottom-6 left-2 bg-conv-primary text-white text-[9px] font-medium px-2 py-1 rounded-md animate-fade-up" style={{ animationDelay: '0.5s' }}>Form</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-conv-primary/10 text-conv-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl text-conv-text-primary">Migration Site Scan</h3>
              </div>
              <p className="text-conv-text-secondary leading-relaxed">
                Rebuilding or migrating an existing site to Webflow? Paste the URL and our AI will audit pages, CMS structures, forms, and integrations automatically.
              </p>
               <ul className="space-y-3 text-sm">
                 <li className="flex items-center gap-2.5 text-conv-text-primary">
                   <CheckCircle2 className="h-4.5 w-4.5 text-conv-primary" />
                   <span>Auto-detect CMS structures and forms</span>
                 </li>
                 <li className="flex items-center gap-2.5 text-conv-text-primary">
                   <CheckCircle2 className="h-4.5 w-4.5 text-conv-primary" />
                   <span>Surface hidden complexity before you quote</span>
                 </li>
              </ul>
              <Button 
                variant="link" 
                className="p-0 h-auto text-conv-primary hover:text-conv-primary/80 font-medium group/btn" 
                asChild
              >
                <Link href="/onboarding?entry=existing" className="flex items-center gap-1.5">
                  Analyze a site 
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
