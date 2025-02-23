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
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAgentCount } from "@/components/agents/hooks/useAgentCount";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
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
        <div className="p-6">
          <img 
            src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
            alt="Ringster Logo" 
            className="h-16 w-auto cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />
        </div>

        {/* User Profile Section */}
        <div className="px-4 mb-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium text-sm truncate">
                  {profile?.full_name || profile?.username || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {profile?.email || "No email"}
                </div>
              </div>
            </button>
          </Card>
        </div>

        {/* Main Menu Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 text-foreground px-6">
                    <Home className="h-5 w-5" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/agents" className="flex items-center justify-between text-foreground group w-full px-6">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <span>AI Agents</span>
                    </div>
                    {agentCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {agentCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/campaigns" className="flex items-center justify-between text-foreground group w-full px-6">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      <span>Campaigns</span>
                    </div>
                    {campaignCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {campaignCount}
                      </Badge>
                    )}
                  </Link>
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
                  <Link to="/dashboard/recordings" className="flex items-center gap-2 text-foreground px-6">
                    <Mic className="h-5 w-5" />
                    <span>Recordings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/analytics" className="flex items-center gap-2 text-foreground px-6">
                    <PieChart className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/team" className="flex items-center gap-2 text-foreground px-6">
                    <Users className="h-5 w-5" />
                    <span>Team</span>
                  </Link>
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
                  <Link to="/dashboard/settings" className="flex items-center gap-2 text-foreground px-6">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/subscription" className="flex items-center gap-2 text-foreground px-6">
                    <CreditCard className="h-5 w-5" />
                    <span>Subscription</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-destructive hover:text-destructive px-6"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </div>
  );
};
