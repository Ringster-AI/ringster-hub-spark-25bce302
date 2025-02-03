import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { NavigationMenu } from "@/components/ui/navigation-menu";

const Index = () => {
  return (
    <main>
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <NavigationMenu />
        </div>
      </nav>
      <Hero />
      <Features />
    </main>
  );
};

export default Index;