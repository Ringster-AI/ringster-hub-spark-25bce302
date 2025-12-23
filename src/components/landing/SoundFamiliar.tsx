
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Bot, 
  Cog, 
  Receipt,
  Check,
  Phone,
  ArrowRight,
  MessageCircle,
  Headphones,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const fears = [
  {
    icon: Bot,
    fear: '"What if it sounds robotic and scares customers away?"',
    answer: "Our AI uses advanced voice tech that sounds natural and warm. Callers often can't tell they're talking to AI—and we'll prove it with a free demo call."
  },
  {
    icon: ShieldCheck,
    fear: '"What if it messes up important calls?"',
    answer: "Ringster knows when to handle calls and when to transfer urgent ones to you immediately. You set the rules, it follows them perfectly."
  },
  {
    icon: Cog,
    fear: '"Am I going to have to learn something complex?"',
    answer: "Setup takes 5 minutes. No tech skills needed. No dashboards to babysit. It just works in the background while you run your business."
  },
  {
    icon: Receipt,
    fear: '"What about hidden costs and overages?"',
    answer: "Simple, transparent pricing. You see exactly what you pay before you start. No Twilio confusion, no surprise bills."
  }
];

const comparisons = [
  { name: "Voicemail", problem: "62% of callers hang up" },
  { name: "Hiring staff", problem: "Expensive + scheduling nightmares" },
  { name: "Call back later", problem: "By then they've called a competitor" },
  { name: "Virtual assistants", problem: "Still need training, still miss calls" }
];

export const SoundFamiliar = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Fears section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            We know what you're <span className="text-primary">worried about</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            These are the exact concerns business owners have before trying Ringster. Here's how we address each one:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-24">
          {fears.map((item, index) => (
            <Card key={index} className="bg-card border-border overflow-hidden">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-3 italic">
                      {item.fear}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              "Why not just let it go to voicemail?"
            </h3>
            <p className="text-muted-foreground">
              Here's why the alternatives don't work for busy business owners:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {comparisons.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
              >
                <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">{item.name}:</span>{" "}
                  <span className="text-muted-foreground">{item.problem}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ringster difference */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h4 className="text-2xl font-bold text-foreground mb-4">
                    Ringster is different
                  </h4>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3 justify-center lg:justify-start">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">Answers instantly—no waiting</span>
                    </li>
                    <li className="flex items-center gap-3 justify-center lg:justify-start">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">Understands what callers need</span>
                    </li>
                    <li className="flex items-center gap-3 justify-center lg:justify-start">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">Books appointments or transfers to you</span>
                    </li>
                    <li className="flex items-center gap-3 justify-center lg:justify-start">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-foreground">Only interrupts you when it matters</span>
                    </li>
                  </ul>
                </div>
                <div className="shrink-0">
                  <Button size="lg" asChild className="text-lg px-8 py-6">
                    <Link to="/signup">
                      <Phone className="mr-2 h-5 w-5" />
                      Try Free For 7 Days
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
