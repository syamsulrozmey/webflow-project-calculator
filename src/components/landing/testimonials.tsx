const testimonials = [
  {
    quote:
      "I used to spend 2-3 hours building estimates in spreadsheets. Now I answer a few questions and get an accurate scope in 10 minutes—complete with phase breakdowns I can actually defend to clients.",
    author: "Alyssa Chen",
    role: "Webflow Developer, Solo Practice",
    avatar: "AC"
  },
  {
    quote:
      "The site scanner changed how we handle migrations. We dropped a WordPress URL in, and it surfaced 47 pages plus 8 CMS collections we would have missed. No more mid-project surprises.",
    author: "Marco Batista",
    role: "Partner, Orbit Digital Agency",
    avatar: "MB"
  },
  {
    quote:
      "We've closed 40% more projects since we started using FlowScope. Clients see the detailed hour breakdown and trust us immediately—it's not just a number, it's a plan.",
    author: "Priya Singh",
    role: "Project Lead, Northwind Studio",
    avatar: "PS"
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative bg-conv-background py-24 overflow-hidden"
    >
      {/* Decorative Side Lines */}
      <div className="absolute left-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      <div className="absolute right-[10%] top-0 bottom-0 dashed-border-vertical hidden lg:block" />
      
      <div className="relative z-10 mx-auto max-w-[90rem] px-6 md:px-10">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-conv-text-primary tracking-tight mb-5">
            Webflow pros are closing more deals.
          </h2>
          <p className="text-lg text-conv-text-secondary leading-relaxed">
             See why freelancers and agencies trust FlowScope to scope every project—from landing pages to enterprise builds.
          </p>
        </div>
        
        {/* Testimonial Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((item, idx) => (
            <figure
              key={item.author}
              className="group flex flex-col justify-between rounded-2xl bg-white p-8 border border-conv-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Star Rating */}
              <div className="mb-6 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className="h-5 w-5 text-yellow-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="mb-8 text-lg leading-relaxed text-conv-text-primary font-medium flex-1">
                "{item.quote}"
              </blockquote>
              
              {/* Author */}
              <figcaption className="flex items-center gap-4 pt-6 border-t border-conv-border-light">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-conv-primary to-conv-primary-hover text-white flex items-center justify-center text-sm font-semibold">
                  {item.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-conv-text-primary">
                    {item.author}
                  </div>
                  <div className="text-sm text-conv-text-muted">
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
