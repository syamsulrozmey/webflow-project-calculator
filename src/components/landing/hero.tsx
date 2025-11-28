import Link from "next/link";
import { Check, ArrowRight, Search, BarChart3, Layers, Zap, LayoutTemplate, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";

const sellingPoints = [
  "Two entry flows: fresh builds + site migrations",
  "Deterministic engine backed by benchmark data",
  "Crawler + AI insights with graceful fallbacks",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-conversion-border-light bg-white">
      {/* Background Layout with Side Panels */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-full h-full bg-dot-pattern bg-conversion-beige/30"></div>
        <div className="w-full max-w-[90rem] h-full bg-white border-x border-dashed border-conversion-border-light relative z-10"></div>
        <div className="w-full h-full bg-dot-pattern bg-conversion-beige/30"></div>
      </div>

      <div className="relative z-20 mx-auto flex max-w-[90rem] flex-col items-center pt-20 lg:pt-32 pb-0">
        
        {/* Content Container */}
        <div className="max-w-4xl px-6 text-center space-y-8 mb-16">
          <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight text-conversion-charcoal md:text-7xl">
            The Modern Webflow<br />
            Estimation Platform
          </h1>
          
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
            Quote Webflow projects with confidence in minutes. Feed in questionnaire answers or crawl an existing site. The calculator blends deterministic hours with crawler intelligence.
          </p>

          <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
            <div className="relative flex items-center w-full max-w-md">
              <Button size="lg" className="w-full sm:w-auto px-8 h-12 text-base rounded-full bg-conversion-dark-blue hover:bg-conversion-dark-blue/90 text-white border-none" asChild>
                <Link href="/onboarding?entry=fresh">
                  Start fresh project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Button
                size="lg"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                asChild
              >
                <Link href="/onboarding?entry=existing">
                  Analyze existing site →
                </Link>
              </Button>
          </div>
        </div>

        {/* Complex UI Mockup */}
        <div className="w-full max-w-[80rem] px-4 lg:px-8">
          <div className="relative rounded-t-2xl border border-b-0 border-conversion-border-light bg-white shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
            
            {/* Mockup Toolbar */}
            <div className="flex items-center justify-between border-b border-conversion-border-light px-4 py-3 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/20 border border-red-400/50"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-400/20 border border-amber-400/50"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400/20 border border-green-400/50"></div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
                <span className="text-conversion-blue">Customizing with brand</span>
                <span className="text-gray-300">|</span>
                <span>2/5 Steps</span>
              </div>
              <div className="w-16"></div>
            </div>

            {/* Mockup Body - 3 Columns */}
            <div className="flex h-[600px] bg-gray-50/50">
              
              {/* Left Sidebar - Controls */}
              <div className="hidden md:flex w-64 flex-col gap-6 border-r border-conversion-border-light bg-white p-6">
                <div className="space-y-4">
                  <div className="h-2 w-24 rounded-full bg-gray-100"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-full rounded-lg border border-dashed border-gray-200 bg-gray-50/50"></div>
                  ))}
                </div>

                <div className="rounded-xl border border-conversion-blue/20 bg-white p-4 shadow-sm ring-1 ring-conversion-blue/20">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-conversion-charcoal">Project Type</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Small Business</span>
                      <Check className="h-3 w-3 text-conversion-green" />
                    </div>
                    <div className="h-px w-full bg-gray-100"></div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Pages</span>
                        <span className="font-medium">12-15</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">CMS</span>
                        <span className="font-medium">Blog, Team</span>
                      </div>
                    </div>
                  </div>
                </div>

                 <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-conversion-charcoal">Multipliers</span>
                  </div>
                   <div className="flex flex-wrap gap-2">
                    {["Design: 1.35×", "SEO: 1.2×"].map(tag => (
                      <span key={tag} className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-muted-foreground">{tag}</span>
                    ))}
                   </div>
                 </div>
              </div>

              {/* Center - Preview Canvas */}
              <div className="flex-1 overflow-hidden p-8 relative">
                 {/* Blue Highlight Border simulating selection */}
                <div className="absolute inset-8 rounded-xl border-2 border-conversion-blue shadow-[0_0_0_4px_rgba(44,120,159,0.1)] pointer-events-none z-20"></div>
                
                <div className="h-full w-full rounded-lg bg-white shadow-sm border border-gray-200 flex flex-col overflow-hidden relative z-10">
                  {/* Preview Header */}
                  <div className="border-b border-gray-100 p-6 text-center">
                    <div className="mx-auto mb-4 h-8 w-8 rounded bg-conversion-charcoal flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl text-conversion-charcoal">Estimate Preview</h3>
                    <p className="text-sm text-muted-foreground mt-2">Generated on {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 bg-gray-50/30 p-8">
                    <div className="mx-auto max-w-sm space-y-6">
                      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 text-center">
                         <span className="text-xs uppercase tracking-widest text-muted-foreground">Total Estimate</span>
                         <div className="mt-2 text-4xl font-medium text-conversion-charcoal">$18,450</div>
                         <div className="mt-1 text-xs text-green-600 font-medium">+15% buffer included</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-white p-4 border border-gray-100">
                           <div className="mb-2 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                             <LayoutTemplate className="h-4 w-4 text-purple-600" />
                           </div>
                           <div className="text-xs text-muted-foreground">Discovery</div>
                           <div className="font-medium">12 hrs</div>
                        </div>
                        <div className="rounded-lg bg-white p-4 border border-gray-100">
                           <div className="mb-2 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                             <MousePointerClick className="h-4 w-4 text-blue-600" />
                           </div>
                           <div className="text-xs text-muted-foreground">Design</div>
                           <div className="font-medium">24 hrs</div>
                        </div>
                      </div>

                      <div className="h-32 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-muted-foreground">
                        Detailed breakdown chart...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Analytics/Properties */}
              <div className="hidden lg:flex w-72 flex-col gap-6 border-l border-conversion-border-light bg-white p-6">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Analytics</span>
                   </div>
                   <div className="space-y-3">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex gap-3">
                         <div className="h-16 w-24 rounded border border-gray-100 bg-gray-50"></div>
                         <div className="space-y-2 flex-1">
                           <div className="h-2 w-full rounded bg-gray-100"></div>
                           <div className="h-2 w-2/3 rounded bg-gray-100"></div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
                
                <div className="mt-auto rounded-xl bg-conversion-beige p-4">
                   <div className="mb-2 flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                     <span className="text-xs font-medium text-conversion-charcoal">AI Insights</span>
                   </div>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Complexity score increased due to custom WebGL interactions detected in the brief. Suggested adding 5h buffer.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
