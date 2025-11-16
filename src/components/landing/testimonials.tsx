const testimonials = [
  {
    quote:
      "We replaced our spreadsheet with this calculator and finally have consistent Webflow proposals.",
    author: "Alyssa Chen",
    role: "Founder, FlowNorth",
  },
  {
    quote:
      "The crawler insights turn a manual audit into a 2-minute deliverable—clients love the transparency.",
    author: "Marco Batista",
    role: "Agency Lead, Orbit Studio",
  },
  {
    quote:
      "As an in-house team, we use the estimates to align stakeholders before we ever brief vendors.",
    author: "Priya Singh",
    role: "Digital PM, Northwind",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="border-b border-white/5 bg-gradient-to-b from-[#080b16] to-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 lg:px-16">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-primary">
            Trusted Results
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Built with Webflow pros in mind.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.author}
              className="rounded-3xl border border-white/5 bg-card/70 p-6 text-sm text-muted-foreground shadow-soft-card backdrop-blur"
            >
              <blockquote className="mb-4 text-base text-foreground">
                “{item.quote}”
              </blockquote>
              <figcaption className="text-xs uppercase tracking-widest text-primary">
                {item.author}
                <span className="block text-[11px] text-muted-foreground">
                  {item.role}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

