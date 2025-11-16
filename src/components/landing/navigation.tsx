import Link from "next/link";

import { Button } from "@/components/ui/button";

const links = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="text-lg font-semibold tracking-tight text-primary">
          Webflow Project Calculator
        </div>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button className="hidden md:inline-flex" size="sm" asChild>
          <Link href="/onboarding">Calculate a project</Link>
        </Button>
      </div>
    </header>
  );
}

