
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I used to lose 3-4 calls a week when I was on jobs. Now every call gets handled. I've booked at least 6 extra jobs this month alone.",
    author: "Mike R.",
    role: "Plumber, Austin TX",
    rating: 5
  },
  {
    quote: "My clients thought I hired a receptionist. When I told them it was AI, they couldn't believe it. It sounds completely natural.",
    author: "Sarah L.",
    role: "Real Estate Agent, Miami",
    rating: 5
  },
  {
    quote: "The ROI was obvious within the first week. I'm saving $2,000/month compared to my old answering service.",
    author: "Dr. James K.",
    role: "Dental Practice Owner",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Real results from <span className="text-primary">real business owners</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Small businesses just like yours are already growing with Ringster
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6 lg:p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
