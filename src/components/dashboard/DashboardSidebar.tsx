import { Bot, Home, Settings, PieChart, Users, User, CreditCard, LogOut, Mic } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const menuItems = [
  { title: "Overview", icon: Home, url: "/dashboard" },
  { title: "AI Agents", icon: Bot, url: "/dashboard/agents" },
  { title: "Recordings", icon: Mic, url: "/dashboard/recordings" },
  { title: "Analytics", icon: PieChart, url: "/dashboard/analytics" },
  { title: "Team", icon: Users, url: "/dashboard/team" },
  { title: "Profile", icon: User, url: "/dashboard/profile" },
  { title: "Subscription", icon: CreditCard, url: "/dashboard/subscription" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

interface DashboardSidebarProps {
  className?: string;
}

export const DashboardSidebar = ({ className = '' }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${className} h-full border-r`}>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">Ringster</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-2 text-foreground">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenuButton 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </div>
  );
};
