import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "I had a landing page for my side project live before lunch. The blocks already look designed, so I only wrote the copy.",
    author: "An Nguyen",
    role: "Indie founder",
  },
  {
    quote:
      "Clients ask for campaign pages constantly. Pageforce lets me ship one, share the URL, and tweak the message after feedback — same link.",
    author: "Mai Le",
    role: "Marketing freelancer",
  },
  {
    quote:
      "The lead form going straight to the dashboard means one less tool to wire up for every little launch.",
    author: "Duc Pham",
    role: "Small agency owner",
  },
];

export function Testimonials() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">What builders say</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Made for people who ship pages weekly
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-xs"
            >
              <Quote className="size-5 text-primary/50" />
              <blockquote className="mt-3 flex-1 text-sm leading-6 text-card-foreground">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground"
                  aria-hidden="true"
                >
                  {testimonial.author.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium text-card-foreground">
                    {testimonial.author}
                  </span>
                  <span className="block text-xs text-muted-foreground">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
