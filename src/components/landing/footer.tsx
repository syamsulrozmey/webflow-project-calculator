const links = [
  { label: "PRD", href: "/requirements/PRD.md" },
  { label: "Tasks", href: "/requirements/tasks.json" },
  { label: "Docs", href: "/docs" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#070910]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          © {new Date().getFullYear()} Webflow Project Calculator. Built for
          deterministic estimates.
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

