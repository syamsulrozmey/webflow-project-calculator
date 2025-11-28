import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Resources", href: "#testimonials" }, // Mapping Testimonials to Resources for now
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-conversion-charcoal py-2 text-center text-xs font-medium text-white transition-colors hover:bg-black">
        <Link href="#" className="inline-flex items-center gap-2 hover:opacity-80">
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">New</span>
          <span>Announcing our v2.0 Algorithm. Read More</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 border-b border-conversion-border-light bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-4 md:px-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-conversion-charcoal"></div>
            <span className="font-serif text-xl font-medium tracking-tight text-conversion-charcoal">
              Conversion
            </span>
          </div>

          {/* Center Nav Links */}
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 transition hover:text-conversion-charcoal"
              >
                {link.label}
                {/* Add Chevron for "Resources" or dropdown-like items if needed */}
                {['Resources', 'Features'].includes(link.label) && <ChevronDown className="h-3 w-3 opacity-50" />}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden text-sm font-medium text-conversion-charcoal hover:bg-transparent hover:text-conversion-blue md:inline-flex" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="rounded-full bg-conversion-dark-blue px-6 text-sm font-medium text-white hover:bg-conversion-dark-blue/90" size="sm" asChild>
              <Link href="/onboarding">Book a demo</Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
