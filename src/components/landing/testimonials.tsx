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
      className="border-b border-conversion-border-light bg-conversion-beige py-24"
    >
      <div className="mx-auto max-w-[90rem] px-6 md:px-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl font-medium text-conversion-charcoal md:text-5xl tracking-tight mb-4">
            Trusted by Webflow pros.
          </h2>
          <p className="text-xl text-muted-foreground">
             From freelancers to enterprise teams.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((item) => (
            <figure
              key={item.author}
              className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-conversion-border-light"
            >
              <div className="mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <blockquote className="mb-6 text-lg leading-relaxed text-conversion-charcoal font-medium">
                “{item.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-6 border-t border-gray-50">
                <div className="h-10 w-10 rounded-full bg-conversion-charcoal text-white flex items-center justify-center text-sm font-bold font-serif">
                    {item.author.charAt(0)}
                </div>
                <div>
                    <div className="text-sm font-semibold text-conversion-charcoal">
                        {item.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {item.role}
                    </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
