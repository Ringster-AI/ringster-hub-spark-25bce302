
import { 
  Phone, 
  Calendar, 
  ArrowRightLeft, 
  Bell, 
  BarChart3, 
  MessageSquare,
  Clock,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Phone,
    name: "Instant Call Answering",
    description: "Every call answered on the first ring. No hold music, no frustrated customers."
  },
  {
    icon: Calendar,
    name: "Smart Booking",
    description: "Callers can book appointments directly. Syncs with your Google Calendar automatically."
  },
  {
    icon: ArrowRightLeft,
    name: "Intelligent Transfers",
    description: "Set rules for when calls should come straight to you. Urgent? You'll know immediately."
  },
  {
    icon: Bell,
    name: "Real-Time Notifications",
    description: "Get summaries of every call via text or email. Know what happened without listening to recordings."
  },
  {
    icon: Clock,
    name: "24/7 Availability",
    description: "Nights, weekends, holidays—your AI receptionist never sleeps, never calls in sick."
  },
  {
    icon: Shield,
    name: "Professional & Consistent",
    description: "Every caller gets the same professional experience. No bad days, no attitude."
  },
  {
    icon: BarChart3,
    name: "Call Analytics",
    description: "See who's calling, when they call, and what they need. Make smarter business decisions."
  },
  {
    icon: MessageSquare,
    name: "Custom Scripts",
    description: "Tailor responses to match your business. Your AI, your voice, your rules."
  }
];

export const Features = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold mb-2">What You Get</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything you need to never miss a lead
          </h2>
          <p className="text-lg text-muted-foreground">
            No tech skills required. No complicated setup. Just results.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
