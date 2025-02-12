import { Home, Bot, Phone, Mic, PieChart, Users, User, CreditCard, Settings, LogOut } from "lucide-react";
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
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAgentCount } from "@/components/agents/hooks/useAgentCount";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface DashboardSidebarProps {
  className?: string;
}

export const DashboardSidebar = ({ className = '' }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: agentCount = 0 } = useAgentCount(true);

  // Get campaign count
  const { data: campaignCount = 0 } = useQuery({
    queryKey: ["campaigns-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

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
          <img 
            src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
            alt="Ringster Logo" 
            className="h-12 w-auto"
          />
        </div>

        {/* Main Menu Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard" className="flex items-center gap-2 text-foreground">
                    <Home className="h-5 w-5" />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/agents" className="flex items-center justify-between text-foreground group w-full">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <span>AI Agents</span>
                    </div>
                    {agentCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {agentCount}
                      </Badge>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/campaigns" className="flex items-center justify-between text-foreground group w-full">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      <span>Campaigns</span>
                    </div>
                    {campaignCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {campaignCount}
                      </Badge>
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/recordings" className="flex items-center gap-2 text-foreground">
                    <Mic className="h-5 w-5" />
                    <span>Recordings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/analytics" className="flex items-center gap-2 text-foreground">
                    <PieChart className="h-5 w-5" />
                    <span>Analytics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/team" className="flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5" />
                    <span>Team</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Menu Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Other Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/settings" className="flex items-center gap-2 text-foreground">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/profile" className="flex items-center gap-2 text-foreground">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/subscription" className="flex items-center gap-2 text-foreground">
                    <CreditCard className="h-5 w-5" />
                    <span>Subscription</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
