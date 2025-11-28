import { ArrowRight, FileText, Globe, CheckCircle2, Search, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-b border-conversion-border-light bg-white py-24 overflow-hidden">
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-medium text-conversion-blue uppercase tracking-wider mb-3">
            Dual Entry Flow
          </p>
          <h2 className="font-serif text-4xl font-medium text-conversion-charcoal md:text-5xl tracking-tight">
            Converging on the same calculation engine.
          </h2>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-2 max-w-6xl mx-auto">
          
          {/* Flow 1: Fresh Project */}
          <div className="group relative rounded-3xl border border-conversion-border-light bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Illustration Area */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-conversion-beige/50 border border-conversion-border-light/50">
              <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
              
              {/* Floating Card - Questionnaire */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 rounded-xl bg-white shadow-lg border border-gray-100 p-5 transition-transform duration-500 group-hover:scale-105">
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-1.5 w-12 rounded-full bg-gray-100">
                    <div className="h-full w-3/4 rounded-full bg-conversion-purple animate-progress-grow"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded border border-conversion-purple/30 flex items-center justify-center ${i === 1 ? 'bg-conversion-purple text-white' : 'bg-white'}`}>
                        {i === 1 && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <div className="h-2 flex-1 rounded bg-gray-100"></div>
                    </div>
                  ))}
                </div>
                
                {/* Result Badge popping up */}
                <div className="absolute -right-4 -bottom-4 rounded-lg bg-conversion-charcoal px-3 py-2 text-white shadow-lg animate-pulse-scale">
                  <div className="text-[10px] opacity-70 uppercase">Estimate</div>
                  <div className="text-sm font-bold">$12,500</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-conversion-purple/10 text-conversion-purple">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl text-conversion-charcoal">Fresh Project Flow</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ideal for new builds. Complete an adaptive questionnaire to define scope, complexity, and features.
              </p>
              <ul className="space-y-2 text-sm text-conversion-charcoal">
                 <li className="flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-conversion-purple" />
                   <span>Adaptive logic skips irrelevant questions</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-conversion-purple" />
                   <span>Instant deterministic pricing</span>
                 </li>
              </ul>
              <Button variant="link" className="p-0 h-auto text-conversion-purple hover:text-conversion-purple/80 mt-2" asChild>
                <Link href="/onboarding?entry=fresh" className="flex items-center gap-1">
                  Start fresh project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Flow 2: Existing Site */}
          <div className="group relative rounded-3xl border border-conversion-border-light bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Illustration Area */}
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl bg-conversion-beige/50 border border-conversion-border-light/50">
              <div className="absolute inset-0 bg-dot-pattern opacity-30"></div>
              
              {/* Browser Window - Scanner */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100 transition-transform duration-500 group-hover:scale-105">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                   <div className="flex-1 h-4 rounded bg-white border border-gray-200 text-[8px] flex items-center px-2 text-gray-400">example.com</div>
                </div>
                <div className="p-4 relative h-32 bg-white">
                   {/* Website Mock Content */}
                   <div className="space-y-2">
                      <div className="h-8 w-full rounded bg-gray-100"></div>
                      <div className="flex gap-2">
                         <div className="h-12 w-1/3 rounded bg-gray-100"></div>
                         <div className="h-12 w-2/3 rounded bg-gray-100"></div>
                      </div>
                      <div className="h-20 w-full rounded bg-gray-50 border border-dashed border-gray-200"></div>
                   </div>

                   {/* Scanner Overlay */}
                   <div className="absolute left-0 right-0 h-0.5 bg-conversion-blue shadow-[0_0_10px_rgba(44,120,159,0.8)] animate-scan z-10 top-0"></div>
                   
                   {/* Detected Tags */}
                   <div className="absolute top-8 right-2 bg-conversion-blue text-white text-[8px] px-1.5 py-0.5 rounded animate-fade-up">CMS</div>
                   <div className="absolute bottom-8 left-2 bg-conversion-blue text-white text-[8px] px-1.5 py-0.5 rounded animate-fade-up" style={{ animationDelay: '0.5s' }}>Form</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-conversion-blue/10 text-conversion-blue">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl text-conversion-charcoal">Existing Site Analysis</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Perfect for migrations. Enter a URL and our crawler will inventory pages, CMS collections, and assets automatically.
              </p>
               <ul className="space-y-2 text-sm text-conversion-charcoal">
                 <li className="flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-conversion-blue" />
                   <span>Firecrawl integration for deep analysis</span>
                 </li>
                 <li className="flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-conversion-blue" />
                   <span>Identify migration risks early</span>
                 </li>
              </ul>
              <Button variant="link" className="p-0 h-auto text-conversion-blue hover:text-conversion-blue/80 mt-2" asChild>
                <Link href="/onboarding?entry=existing" className="flex items-center gap-1">
                  Analyze site <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
