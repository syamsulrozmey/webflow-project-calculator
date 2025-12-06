"use client";

import Link from "next/link";
import { ArrowRight, Calculator, Layers, Clock, FileText, Layout, Database, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

// Animated Number Component
function AnimatedPrice({ from, to, isAnimating }: { from: number; to: number; isAnimating: boolean }) {
  const [displayValue, setDisplayValue] = useState(from);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayValue(to);
      // Cancel any ongoing animation when not animating
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const duration = 2000;
    const startTime = performance.now();
    const startValue = from;
    const endValue = to;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * ease;
      setDisplayValue(Math.floor(current));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    // Cleanup function to cancel animation frame if component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isAnimating, from, to]);

  return (
    <span className="tabular-nums tracking-tight">${displayValue.toLocaleString()}</span>
  );
}

export function HeroSection() {
  const [activeOption, setActiveOption] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [price, setPrice] = useState(12500);
  const [hours, setHours] = useState(125);
  const previousPriceRef = useRef(12500);
  const currentPriceRef = useRef(12500);

  const options = [
    { label: "Small Business Site", price: 12500, hours: 125, pages: "10-15 pages", cms: "Basic CMS" },
    { label: "SaaS Marketing Site", price: 24500, hours: 245, pages: "20-30 pages", cms: "Advanced CMS" },
    { label: "E-commerce Store", price: 38000, hours: 380, pages: "50+ pages", cms: "Full Commerce" }
  ];

  // Auto-rotate through project options
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOption((prev) => (prev + 1) % options.length);
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle price/hours updates and animation when activeOption changes
  useEffect(() => {
    const newOption = options[activeOption];
    
    // Capture current price as the animation start point before updating
    previousPriceRef.current = currentPriceRef.current;
    
    // Update to new values
    currentPriceRef.current = newOption.price;
    setPrice(newOption.price);
    setHours(newOption.hours);
    
    // Skip animation on initial mount (when previous equals current)
    if (previousPriceRef.current === currentPriceRef.current) {
      return;
    }
    
    // Start animation
    setIsCalculating(true);
    const timeout = setTimeout(() => {
      setIsCalculating(false);
    }, 2000);
    
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOption]); // Only react to option changes - options array is stable

  return (
    <section className="relative overflow-hidden bg-conv-background">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50" />

      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10 lg:px-16 pt-20 lg:pt-28 pb-20 lg:pb-28">
        
        {/* Centered Content */}
        <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-conv-primary/10 text-conv-primary text-sm font-medium px-4 py-2 rounded-full mb-8 animate-fade-in-up">
            <Calculator className="h-4 w-4" />
            Built specifically for Webflow projects
          </div>
          
          {/* Hero Heading */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight text-conv-text-primary mb-8 animate-fade-in-up">
            Stop Guessing.<br />
            Start Scoping.
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-conv-text-secondary leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The AI-powered project calculator that turns Webflow requirements into accurate estimates. 
            Analyze sites, scope builds, and generate professional proposals in minutes—not hours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg"
              className="rounded-full bg-conv-primary px-8 h-14 text-base font-medium text-white hover:bg-conv-primary-hover shadow-button hover:shadow-button-hover transition-all duration-200 hover:-translate-y-0.5" 
              asChild
            >
              <Link href="/onboarding" className="flex items-center gap-2">
                Create Your First Estimate
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-14 text-base font-medium border-conv-border hover:bg-white hover:border-conv-text-muted transition-all duration-200" 
              asChild
            >
              <Link href="#workflow">
                See How It Works
              </Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <p className="text-sm text-conv-text-muted mt-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            Free to use • No credit card required • Unlimited estimates
          </p>
        </div>

        {/* Hero Visual - Bento Grid Layout */}
        <div className="relative max-w-[70rem] mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 bg-conv-background/50 rounded-3xl border border-conv-border">
            
            {/* Left Column */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              
              {/* Card 1: Project Structure */}
              <div className="bg-white rounded-2xl border border-conv-border shadow-sm p-4 flex-1">
                 <div className="mb-4 pb-2 border-b border-conv-border-light">
                   <span className="text-xs font-semibold text-conv-text-primary uppercase tracking-wider">Site Structure</span>
                 </div>
                 <div className="space-y-2">
                  {[
                    { name: "Homepage", icon: Layout, type: "Static" },
                    { name: "About Us", icon: FileText, type: "Static" },
                    { name: "Services", icon: Layers, type: "CMS" },
                    { name: "Blog", icon: Database, type: "CMS", active: true },
                    { name: "Contact", icon: FileText, type: "Form" }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`group flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                        item.active 
                          ? 'bg-conv-primary/5 border border-conv-primary/10 shadow-sm translate-x-1' 
                          : 'hover:bg-conv-background hover:translate-x-0.5'
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${
                        item.active ? 'bg-conv-primary text-white' : 'bg-conv-background text-conv-text-secondary group-hover:bg-white group-hover:shadow-sm'
                      }`}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-conv-text-primary truncate">{item.name}</div>
                        <div className="text-[9px] text-conv-text-muted uppercase tracking-wider">{item.type}</div>
                      </div>
                    </div>
                  ))}
                 </div>
              </div>

              {/* Card 2: Configuration/Settings */}
              <div className="bg-white rounded-2xl border border-conv-border shadow-sm p-4">
                <div className="mb-4 pb-2 border-b border-conv-border-light">
                   <span className="text-xs font-semibold text-conv-text-primary uppercase tracking-wider">Config</span>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="text-[10px] font-medium text-conv-text-muted uppercase mb-2 block">Complexity</label>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#F6F6F7] border border-conv-border-light flex items-center justify-center cursor-pointer hover:border-conv-primary/50 transition-colors">
                          <div className="h-4 w-4 bg-conv-text-primary rounded-sm"></div>
                        </div>
                         <div className="h-8 w-8 rounded-lg bg-[#F6F6F7] border border-conv-border-light flex items-center justify-center cursor-pointer hover:border-conv-primary/50 transition-colors">
                          <div className="h-4 w-4 bg-[#FFD02B] rounded-full"></div>
                        </div>
                         <div className="h-8 w-8 rounded-lg bg-[#F6F6F7] border border-conv-border-light flex items-center justify-center cursor-pointer hover:border-conv-primary/50 transition-colors">
                          <Zap className="h-4 w-4 text-conv-text-secondary" />
                        </div>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-medium text-conv-text-muted uppercase mb-2 block">Integrations</label>
                      <div className="flex gap-2">
                         <div className="h-8 w-8 rounded-full bg-[#F6F6F7] flex items-center justify-center border border-conv-border-light p-1.5" title="Webflow">
                           <img src="https://cdn.prod.website-files.com/6347616673534233f57013dc/634761667353420223701469_webflow-icon-black.svg" alt="Webflow" className="w-full h-full opacity-80" />
                         </div>
                         <div className="h-8 w-8 rounded-full bg-[#F6F6F7] flex items-center justify-center border border-conv-border-light" title="Zapier">
                           <Zap className="h-4 w-4 text-[#FF4F00]" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>

            </div>

            {/* Center Column - Main Estimate */}
            <div className="lg:col-span-6 flex flex-col">
               <div className="bg-white rounded-2xl border border-conv-border shadow-card h-full flex flex-col overflow-hidden relative group">
                
                {/* Status Bar */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-conv-border-light bg-white z-10">
                  <div className="flex items-center gap-2">
                     <div className={`h-2 w-2 rounded-full ${isCalculating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                     <span className="text-xs font-medium text-conv-text-secondary">
                       {isCalculating ? 'Analyzing Requirements...' : 'Analysis Complete'}
                     </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-conv-text-muted uppercase tracking-wider">V 2.0</span>
                    <div className="h-3 w-px bg-conv-border-light"></div>
                    <span className="text-[10px] text-conv-text-muted uppercase tracking-wider">Auto-Saved</span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col relative">
                   {/* Background Grid Effect */}
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                   <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-conv-background/20 pointer-events-none"></div>
                   
                   <div className="relative z-10 text-center mt-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-conv-text-primary text-white mb-5 shadow-lg transform transition-transform group-hover:scale-110 duration-500">
                        <Calculator className="h-7 w-7" />
                      </div>
                      <h3 className="font-serif text-xl font-normal leading-tight tracking-tight text-conv-text-primary mb-1">Webflow Project Estimate</h3>
                      <p className="text-sm text-conv-text-secondary mb-8">Generated for {options[activeOption].label}</p>
                   </div>

                   <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-conv-border shadow-sm text-center mb-6 transform transition-all duration-500 hover:shadow-md">
                      <div className="text-xs font-semibold text-conv-text-muted uppercase tracking-widest mb-2">Estimated Total</div>
                      <div className="font-serif text-5xl lg:text-6xl font-medium text-conv-text-primary mb-4 tracking-tight">
                        <AnimatedPrice from={previousPriceRef.current} to={price} isAnimating={isCalculating} />
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-conv-background border border-conv-border-light text-xs font-medium text-conv-text-secondary">
                         <Clock className="h-3.5 w-3.5" />
                         <span>{hours} Production Hours</span>
                      </div>
                   </div>

                   {/* Mini Chart Visual */}
                   <div className="flex-1 flex items-end justify-center gap-1 px-8 pb-2 opacity-50">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-conv-primary/20 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}></div>
                      ))}
                   </div>
                </div>
               </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              
              {/* Card 3: Variants / Project Types */}
              <div className="bg-white rounded-2xl border border-conv-border shadow-sm p-4">
                 <div className="mb-4 pb-2 border-b border-conv-border-light flex justify-between items-center">
                   <span className="text-xs font-semibold text-conv-text-primary uppercase tracking-wider">Project Type</span>
                   <span className="text-[10px] bg-conv-background px-1.5 py-0.5 rounded text-conv-text-muted">1/3</span>
                 </div>
                 <div className="space-y-2">
                   {options.map((option, idx) => (
                     <button
                       key={idx}
                       onClick={() => setActiveOption(idx)}
                       className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all duration-200 flex items-center justify-between group ${
                         activeOption === idx 
                           ? 'bg-white border border-conv-primary text-conv-primary shadow-sm' 
                           : 'bg-conv-background/50 border border-transparent text-conv-text-secondary hover:bg-white hover:border-conv-border-light'
                       }`}
                     >
                       <span className="font-medium">{option.label}</span>
                       {activeOption === idx && <div className="h-1.5 w-1.5 rounded-full bg-conv-primary"></div>}
                     </button>
                   ))}
                 </div>
              </div>

              {/* Card 4: Analytics / Phases */}
              <div className="bg-white rounded-2xl border border-conv-border shadow-sm p-4 flex-1">
                 <div className="mb-4 pb-2 border-b border-conv-border-light">
                   <span className="text-xs font-semibold text-conv-text-primary uppercase tracking-wider">Phases</span>
                 </div>
                 <div className="space-y-3">
                    {[
                      { label: "Strategy", pct: 15 },
                      { label: "Design", pct: 35 },
                      { label: "Development", pct: 40 },
                      { label: "QA", pct: 10 }
                    ].map((phase, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium text-conv-text-secondary">
                          <span>{phase.label}</span>
                          <span>{phase.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-conv-background rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-conv-primary/80 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: isCalculating ? '0%' : `${phase.pct}%`, transitionDelay: `${idx * 100}ms` }}
                           ></div>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {/* Mini Line Chart */}
                 <div className="mt-6 pt-4 border-t border-conv-border-light">
                    <div className="h-12 flex items-end justify-between gap-1">
                       <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                          <path 
                             d="M0 30 L10 25 L20 28 L30 15 L40 20 L50 10 L60 18 L70 5 L80 12 L90 8 L100 0" 
                             fill="none" 
                             stroke="currentColor" 
                             strokeWidth="2" 
                             className="text-conv-border-light"
                          />
                          <path 
                             d="M0 30 L10 25 L20 28 L30 15 L40 20 L50 10 L60 18 L70 5 L80 12 L90 8 L100 0" 
                             fill="none" 
                             stroke="currentColor" 
                             strokeWidth="2" 
                             className="text-conv-primary animate-dash"
                             strokeDasharray="200"
                             strokeDashoffset={isCalculating ? "200" : "0"}
                             style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                          />
                       </svg>
                    </div>
                 </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
