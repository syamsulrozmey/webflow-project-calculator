const flows = [
  {
    title: "Fresh Project Flow",
    steps: [
      "Select user type + project type",
      "Complete adaptive questionnaire",
      "Review deterministic estimate + tiers",
      "Export PDF/CSV proposals",
    ],
  },
  {
    title: "Existing Site Analysis",
    steps: [
      "Input URL and kick off Firecrawl",
      "Review CMS/interaction inventory",
      "Answer delta-focused questions",
      "Compare internal vs client-ready pricing",
    ],
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="border-b border-white/5 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-primary">
            Dual Entry Flow
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Converging on the same calculation engine.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {flows.map((flow) => (
            <div
              key={flow.title}
              className="rounded-3xl border border-white/5 bg-card/70 p-6 shadow-soft-card backdrop-blur"
            >
              <h3 className="text-xl font-semibold">{flow.title}</h3>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                {flow.steps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-background/50 p-3"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

