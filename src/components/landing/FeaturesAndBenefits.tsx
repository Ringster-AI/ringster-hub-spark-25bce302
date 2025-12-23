
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PhoneOff, 
  Clock, 
  DollarSign, 
  Zap, 
  Calendar, 
  ArrowRightLeft,
  Wrench,
  Stethoscope,
  Home,
  Scissors,
  Building,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const painPoints = [
  {
    icon: PhoneOff,
    problem: "Missed calls = missed money",
    solution: "Ringster answers every call instantly, 24/7/365"
  },
  {
    icon: Clock,
    problem: "Phone tag kills your productivity",
    solution: "Callers get handled immediately—no callbacks needed"
  },
  {
    icon: DollarSign,
    problem: "Hiring staff is expensive",
    solution: "Fraction of the cost of a receptionist, works 10x the hours"
  }
];

const whoItsFor = [
  { icon: Wrench, title: "Plumbers & Electricians", desc: "On a job site? Your calls still get answered." },
  { icon: Scissors, title: "Salons & Spas", desc: "Book appointments while you're with clients." },
  { icon: Stethoscope, title: "Clinics & Practices", desc: "Handle patient inquiries 24/7." },
  { icon: Home, title: "Real Estate Agents", desc: "Never miss a hot lead showing interest." },
  { icon: Building, title: "Small Agencies", desc: "Professional call handling without the overhead." },
  { icon: Briefcase, title: "Consultants & Freelancers", desc: "Stay focused on billable work." }
];

export const FeaturesAndBenefits = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why <span className="text-primary">voicemail is killing</span> your business
          </h2>
          <p className="text-lg text-muted-foreground">
            62% of callers won't leave a voicemail. They'll just call your competitor instead.
          </p>
        </div>

        {/* Pain points */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {painPoints.map((item, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-6 lg:p-8">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-2 line-through decoration-destructive/50">
                  {item.problem}
                </p>
                <p className="text-muted-foreground flex items-start gap-2">
                  <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {item.solution}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Who it's for */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Built for people who run their business from their phone
          </h3>
          <p className="text-muted-foreground">
            If a missed call means lost money, Ringster is for you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-16">
          {whoItsFor.map((item, index) => (
            <div 
              key={index} 
              className="flex items-start gap-4 p-4 lg:p-6 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link to="/signup">
              See How It Works For Your Business
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
