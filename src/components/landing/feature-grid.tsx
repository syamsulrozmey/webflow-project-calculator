import { Bot, Calculator, FileChartColumn, ShieldCheck, Layers, Zap, ArrowRight, Globe, Clock, Users, Cpu, FileCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Transparent Pricing Logic",
    description:
      "No black boxes. Our calculation engine uses clear formulas—base hours, complexity multipliers, and phase breakdowns you can explain to any client.",
    icon: Calculator,
  },
  {
    title: "AI-Powered Site Analysis",
    description:
      "Drop in any URL and instantly surface page counts, CMS collections, integrations, and migration complexity—no manual audits required.",
    icon: Bot,
  },
  {
    title: "Client-Ready Proposals",
    description:
      "Export polished PDF estimates with phased timelines, risk factors, and scope breakdowns that build trust and close deals.",
    icon: FileChartColumn,
  },
  {
    title: "Built for Webflow Teams",
    description:
      "Configure team rates, overhead margins, and custom multipliers. Your estimates reflect your actual costs and capacity.",
    icon: Users,
  },
  {
    title: "Webflow-Specific Scoping",
    description: "Map requirements to Webflow components—CMS structures, interactions, Lottie animations, Client-first classes—for granular accuracy.",
    icon: Layers
  },
  {
    title: "Save Hours Every Week",
    description: "What used to take hours of spreadsheet wrestling now takes minutes. More time selling, less time calculating.",
    icon: Clock
  }
];

export function FeatureGrid() {
  return (
    <section id="features" className="relative bg-conv-section-mint py-24 overflow-hidden">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-conv-text-primary tracking-tight leading-tight">
              Everything you need to scope Webflow projects with confidence
            </h2>
          </div>
          <div className="lg:pt-2">
            <p className="text-lg text-conv-text-secondary leading-relaxed mb-6">
              From quick landing page quotes to complex e-commerce migrations—FlowScope handles the math so you can focus on winning the work.
            </p>
            <Button 
              className="rounded-full bg-conv-text-primary px-6 text-sm font-medium text-white hover:bg-conv-text-primary/90 transition-all duration-200 hover:-translate-y-0.5" 
              asChild
            >
              <Link href="/onboarding" className="flex items-center gap-2">
                Try it free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards - Visual Demo: Abstract Workflow */}
        <div className="bg-conv-section-sage rounded-3xl p-8 lg:p-12 border border-conv-border/50">
          <div className="bg-white rounded-2xl shadow-card border border-conv-border overflow-hidden min-h-[400px] relative flex items-center justify-center p-8">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-white pointer-events-none" />

            {/* Workflow Diagram */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-20 w-full max-w-5xl justify-center">
              
              {/* Step 1: Input */}
              <div className="relative group">
                <div className="w-20 h-20 bg-white rounded-2xl border-2 border-conv-primary shadow-lg flex flex-col items-center justify-center gap-2 relative z-10 transition-transform hover:scale-105 duration-300">
                   <div className="h-8 w-8 rounded-lg bg-conv-section-mint flex items-center justify-center text-conv-primary">
                     <Globe className="h-5 w-5" />
                   </div>
                   <span className="text-[9px] font-semibold text-conv-text-primary uppercase tracking-wider">Inputs</span>
                </div>
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-full w-8 md:w-20 h-[2px] bg-conv-border -z-0 hidden md:block overflow-hidden">
                   <div className="absolute inset-0 bg-conv-primary animate-flow-horiz"></div>
                </div>
                <div className="absolute left-1/2 top-full h-8 w-[2px] bg-conv-border -z-0 md:hidden overflow-hidden">
                   <div className="absolute inset-0 bg-conv-primary animate-flow-vert"></div>
                </div>
              </div>

              {/* Step 2: AI Processing */}
              <div className="relative group">
                <div className="w-24 h-24 bg-conv-primary rounded-2xl shadow-xl flex flex-col items-center justify-center gap-2 relative z-10 animate-pulse">
                   <Zap className="h-8 w-8 text-white" />
                   <span className="text-[9px] font-semibold text-white uppercase tracking-wider">AI Analysis</span>
                </div>
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-full w-8 md:w-20 h-[2px] bg-conv-border -z-0 hidden md:block overflow-hidden">
                   <div className="absolute inset-0 bg-conv-primary animate-flow-horiz"></div>
                </div>
                <div className="absolute left-1/2 top-full h-8 w-[2px] bg-conv-border -z-0 md:hidden overflow-hidden">
                   <div className="absolute inset-0 bg-conv-primary animate-flow-vert"></div>
                </div>
              </div>

              {/* Step 3: Strategy/Structure (New Step) */}
              <div className="relative group">
                <div className="w-20 h-20 bg-white rounded-2xl border-2 border-conv-primary shadow-lg flex flex-col items-center justify-center gap-2 relative z-10 transition-transform hover:scale-105 duration-300">
                   <div className="h-8 w-8 rounded-lg bg-conv-section-mint flex items-center justify-center text-conv-primary">
                     <Cpu className="h-5 w-5" />
                   </div>
                   <span className="text-[9px] font-semibold text-conv-text-primary uppercase tracking-wider">Strategy</span>
                </div>
                
                {/* Branching Connector Area */}
                <div className="absolute top-1/2 left-full w-20 hidden md:flex flex-col justify-center items-start -translate-y-1/2 h-[200px]">
                   {/* Top Branch */}
                   <div className="absolute top-[15%] left-0 w-full h-[35%] border-l-2 border-t-2 border-conv-border rounded-tl-xl overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-conv-primary animate-flow-horiz"></div>
                      <div className="absolute top-0 left-[-2px] w-[2px] h-full bg-conv-primary animate-flow-vert" style={{ animationDirection: 'reverse' }}></div>
                   </div>
                   
                   {/* Middle Branch */}
                   <div className="absolute top-1/2 left-0 w-full h-[2px] bg-conv-border overflow-hidden">
                      <div className="absolute inset-0 bg-conv-primary animate-flow-horiz"></div>
                   </div>

                   {/* Bottom Branch */}
                   <div className="absolute bottom-[15%] left-0 w-full h-[35%] border-l-2 border-b-2 border-conv-border rounded-bl-xl overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-conv-primary animate-flow-horiz"></div>
                      <div className="absolute bottom-0 left-[-2px] w-[2px] h-full bg-conv-primary animate-flow-vert"></div>
                   </div>
                </div>
              </div>

              {/* Step 4: Outputs & Final */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                
                {/* Column of 3 Outputs */}
                <div className="flex flex-col gap-4 pl-4 md:pl-0 relative">
                   {/* Output 1 */}
                   <div className="flex items-center gap-3 bg-white border border-conv-border-light p-3 rounded-xl shadow-sm w-56 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-conv-primary/30 group/card relative">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover/card:scale-110 transition-transform">
                        <FileChartColumn className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-conv-text-primary">Detailed Scope</div>
                        <div className="text-[10px] text-conv-text-muted">Itemized breakdown</div>
                      </div>
                      {/* Line Connector for Top Card */}
                      <div className="absolute left-full top-1/2 w-4 h-[2px] bg-conv-border hidden md:block"></div>
                      <div className="absolute left-full top-1/2 w-4 h-[calc(50%+1rem+2px)] border-r-2 border-t-2 border-conv-border rounded-tr-xl translate-x-4 hidden md:block"></div>
                   </div>

                   {/* Output 2 */}
                   <div className="flex items-center gap-3 bg-white border border-conv-border-light p-3 rounded-xl shadow-sm w-56 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-conv-primary/30 group/card relative">
                      <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover/card:scale-110 transition-transform">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-conv-text-primary">Timeline Estimate</div>
                        <div className="text-[10px] text-conv-text-muted">Phase-by-phase</div>
                      </div>
                      {/* Line Connector for Middle Card */}
                      <div className="absolute left-full top-1/2 w-8 h-[2px] bg-conv-border hidden md:block overflow-hidden">
                         <div className="absolute inset-0 bg-conv-primary animate-flow-horiz"></div>
                      </div>
                   </div>

                   {/* Output 3 */}
                   <div className="flex items-center gap-3 bg-white border border-conv-border-light p-3 rounded-xl shadow-sm w-56 hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-conv-primary/30 group/card relative">
                      <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover/card:scale-110 transition-transform">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-conv-text-primary">Risk Analysis</div>
                        <div className="text-[10px] text-conv-text-muted">Complexity score</div>
                      </div>
                      {/* Line Connector for Bottom Card */}
                      <div className="absolute left-full top-1/2 w-4 h-[2px] bg-conv-border hidden md:block"></div>
                      <div className="absolute left-full bottom-1/2 w-4 h-[calc(50%+1rem+2px)] border-r-2 border-b-2 border-conv-border rounded-br-xl translate-x-4 hidden md:block"></div>
                   </div>
                </div>

                {/* Step 5: Final Output */}
                <div className="relative group pt-4 md:pt-0">
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-conv-primary shadow-lg flex flex-col items-center justify-center gap-2 relative z-10 transition-transform hover:scale-105 duration-300">
                     <div className="h-10 w-10 rounded-lg bg-conv-primary flex items-center justify-center text-white">
                       <FileCheck className="h-6 w-6" />
                     </div>
                     <span className="text-[9px] font-semibold text-conv-text-primary uppercase tracking-wider">Final Quote</span>
                  </div>
                  {/* Connecting Line from Convergence Point */}
                  <div className="absolute right-full top-1/2 w-8 h-[2px] bg-conv-border hidden md:block overflow-hidden">
                     <div className="absolute inset-0 bg-conv-primary animate-flow-horiz"></div>
                  </div>
                  {/* Mobile Connector */}
                  <div className="absolute left-1/2 bottom-full h-4 w-[2px] bg-conv-border -z-0 md:hidden overflow-hidden">
                     <div className="absolute inset-0 bg-conv-primary animate-flow-vert"></div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-16">
          {features.map(({ title, description, icon: Icon }, idx) => (
            <div
              key={title}
              className="group relative bg-white rounded-2xl p-8 border border-conv-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-conv-section-mint text-conv-primary group-hover:bg-conv-primary group-hover:text-white transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl text-conv-text-primary">
                  {title}
                </h3>
                <p className="text-conv-text-secondary leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
