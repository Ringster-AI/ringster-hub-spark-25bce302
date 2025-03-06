
import { Settings, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface OtherMenuProps {
  onLinkClick?: () => void;
}

export const OtherMenu = ({ onLinkClick }: OtherMenuProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Other Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link 
                to="/dashboard/settings" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Subscription">
              <Link 
                to="/dashboard/subscription" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <CreditCard className="h-5 w-5" />
                <span>Subscription</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
