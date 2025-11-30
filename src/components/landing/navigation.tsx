"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-conv-section-announcement py-2.5 text-center">
        <Link 
          href="#features" 
          className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors"
        >
          <span>Now with AI-powered site analysis.</span>
          <span className="font-medium">See how it works</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 border-b border-conv-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-4 md:px-10">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-lg bg-conv-text-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-conv-text-primary">
              FlowScope
            </span>
          </Link>

          {/* Center Nav Links - Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-conv-text-secondary hover:text-conv-text-primary transition-colors rounded-lg hover:bg-conv-background"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions - Desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-conv-text-secondary hover:text-conv-text-primary hover:bg-transparent" 
              asChild
            >
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button 
              className="rounded-full bg-conv-primary px-6 text-sm font-medium text-white hover:bg-conv-primary-hover shadow-button hover:shadow-button-hover transition-all duration-200 hover:-translate-y-0.5" 
              asChild
            >
              <Link href="/onboarding" className="flex items-center gap-2">
                Start Estimating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-conv-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-conv-border bg-white px-6 py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 text-base font-medium text-conv-text-secondary hover:text-conv-text-primary transition-colors rounded-lg hover:bg-conv-background"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-conv-border mt-4 pt-4 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full" 
                  asChild
                >
                  <Link href="/dashboard">Login</Link>
                </Button>
                <Button 
                  className="w-full rounded-full bg-conv-primary text-white hover:bg-conv-primary-hover" 
                  asChild
                >
                  <Link href="/onboarding" className="flex items-center justify-center gap-2">
                    Start Estimating
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
