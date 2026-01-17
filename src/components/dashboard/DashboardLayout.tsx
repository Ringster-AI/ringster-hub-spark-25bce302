
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackDialog } from "./FeedbackDialog";
import { useEffect, useState } from "react";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSheetOpen) {
        setIsSheetOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSheetOpen]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/90">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[280px] p-0"
            >
              <nav className="h-full py-4 overflow-y-auto">
                <DashboardSidebar className="border-none" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <main className="flex-1 bg-background md:ml-0 overflow-x-hidden">{children}</main>
        <FeedbackDialog />
      </div>
    </SidebarProvider>
  );
};
