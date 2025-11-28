import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
    { label: "Enterprise", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Community", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Legal", href: "#" },
    { label: "Contact", href: "#" },
  ]
};

export function LandingFooter() {
  return (
    <footer className="border-t border-conversion-border-light bg-white pt-24 pb-12">
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-16">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-conversion-charcoal"></div>
              <span className="font-serif text-2xl font-medium tracking-tight text-conversion-charcoal">
                Conversion
              </span>
            </div>
            <p className="max-w-xs text-muted-foreground text-lg leading-relaxed">
              The Al-native Marketing Automation Platform built for high-growth B2B businesses.
            </p>
            <div className="flex gap-4 pt-4">
               {/* Social Placeholders */}
               <div className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"></div>
               <div className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"></div>
               <div className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"></div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-6">
              <h4 className="font-medium text-conversion-charcoal text-base">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-conversion-blue transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Webflow Project Calculator. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-conversion-charcoal">Privacy Policy</Link>
            <Link href="#" className="hover:text-conversion-charcoal">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
