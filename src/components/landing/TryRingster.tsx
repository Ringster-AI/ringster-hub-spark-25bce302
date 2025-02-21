
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from "lucide-react";

export const TryRingster = () => {
  const handleCall = () => {
    window.location.href = "tel:+16204458363";
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <Card className="overflow-hidden bg-gradient-to-r from-[#1A1F2C] to-[#222222] border-0 shadow-2xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Try Ringster
                </h2>
                <p className="text-xl text-gray-300">
                  Experience next level technology
                </p>
                <Button 
                  size="lg" 
                  onClick={handleCall}
                  className="w-full md:w-auto bg-[#DD2476] hover:bg-[#DD2476]/90 text-white gap-2 text-lg py-6"
                >
                  <Phone className="w-5 h-5" />
                  Dial +1 620-445-8363 Right now
                </Button>
              </div>
              <div className="flex justify-center md:justify-center">
                <img
                  src="/lovable-uploads/2bc59770-92ba-4abb-83fb-3f10afdb837e.png"
                  alt="Ringster AI Agent"
                  className="rounded-lg shadow-lg w-72 h-72 object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
