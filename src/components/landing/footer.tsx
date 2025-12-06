import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
    { label: "Get Started", href: "/onboarding" },
  ],
  Resources: [
    { label: "Webflow Pricing Guide", href: "#" },
    { label: "Scoping Best Practices", href: "#" },
    { label: "Agency Rate Calculator", href: "#" },
    { label: "Migration Checklist", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ]
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function LandingFooter() {
  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden">
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-conv-text-primary flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-conv-text-primary">
                FlowScope
              </span>
            </Link>
            <p className="max-w-xs text-conv-text-secondary text-base leading-relaxed">
              The AI-powered project calculator built for Webflow professionals who want to scope accurately and close deals faster.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-conv-background hover:bg-conv-section-mint text-conv-text-muted hover:text-conv-primary transition-all duration-200 flex items-center justify-center"
                  aria-label={social.label}
                >
                  <social.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-5">
              <h4 className="font-serif text-base font-normal leading-tight tracking-tight text-conv-text-primary">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-conv-text-secondary hover:text-conv-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-conv-border-light pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-conv-text-muted">
          <div>
            © {new Date().getFullYear()} FlowScope. The Webflow Project Calculator.
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-conv-text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-conv-text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
