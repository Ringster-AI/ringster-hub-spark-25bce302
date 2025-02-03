import { Bot, Brain, Zap, Clock, Phone, ArrowUpRight, BarChart } from "lucide-react";

const features = [
  {
    name: "24/7 Operation",
    description: "Never miss a call with AI agents that handle customer inquiries around the clock.",
    icon: Clock,
  },
  {
    name: "Smart Call Routing",
    description: "Intelligent decision-making ensures calls reach the right person at the right time.",
    icon: Brain,
  },
  {
    name: "Instant Setup",
    description: "Get your AI phone system up and running in minutes, not days.",
    icon: Zap,
  },
  {
    name: "Call Analytics",
    description: "Track performance and gain insights from every customer interaction.",
    icon: BarChart,
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-white sm:py-32">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animate-fade-up">
          <h2 className="text-base font-semibold leading-7 text-[#DD2476]">
            Powerful Features
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for seamless call handling
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start animate-fade-up hover:translate-y-[-4px] transition-transform duration-300">
                <div className="rounded-lg bg-gradient-to-br from-[#FF512F] to-[#DD2476] p-2 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <dt className="mt-4 font-semibold text-gray-900">{feature.name}</dt>
                <dd className="mt-2 leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};