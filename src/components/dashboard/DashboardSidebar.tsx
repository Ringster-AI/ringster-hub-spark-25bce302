
import { LogOut } from "lucide-react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAgentCount } from "@/components/agents/hooks/useAgentCount";
import { useQuery } from "@tanstack/react-query";
import { UserProfile } from "./sidebar/UserProfile";
import { MainMenu } from "./sidebar/MainMenu";
import { ManagementMenu } from "./sidebar/ManagementMenu";
import { OtherMenu } from "./sidebar/OtherMenu";

interface DashboardSidebarProps {
  className?: string;
}

export const DashboardSidebar = ({ className = '' }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setOpenMobile } = useSidebar();
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

  const handleLinkClick = () => {
    // Close the mobile sidebar when a link is clicked
    setOpenMobile(false);
  };

  return (
    <div className={`${className} h-full border-r`}>
      <SidebarContent>
        <div className="p-6">
          <img 
            src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
            alt="Ringster Logo" 
            className="h-16 w-auto cursor-pointer"
            onClick={() => {
              navigate('/dashboard');
              handleLinkClick();
            }}
          />
        </div>

        <UserProfile profile={profile} />
        <MainMenu 
          agentCount={agentCount} 
          campaignCount={campaignCount} 
          onLinkClick={handleLinkClick}
        />
        <ManagementMenu onLinkClick={handleLinkClick} />
        <OtherMenu onLinkClick={handleLinkClick} />
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
