
import { Mic, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface ManagementMenuProps {
  onLinkClick?: () => void;
}

export const ManagementMenu = ({ onLinkClick }: ManagementMenuProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Management</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Recordings">
              <Link 
                to="/dashboard/recordings" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <Mic className="h-5 w-5" />
                <span>Recordings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Analytics">
              <Link 
                to="/dashboard/analytics" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Team">
              <Link 
                to="/dashboard/team" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <Users className="h-5 w-5" />
                <span>Team</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
