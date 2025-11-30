
import { Home, Bot, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CreditDisplay } from "@/components/credits/CreditDisplay";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MainMenuProps {
  agentCount: number;
  campaignCount: number;
  onLinkClick?: () => void;
}

export const MainMenu = ({ agentCount, campaignCount, onLinkClick }: MainMenuProps) => {
  return (
    <>
      <div className="px-4 py-2">
        <CreditDisplay 
          compact={true}
          onUpgrade={() => {
            window.location.href = '/dashboard/subscription';
          }}
        />
      </div>
      
      <SidebarGroup>
        <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-foreground px-6"
                onClick={onLinkClick}
              >
                <Home className="h-5 w-5" />
                <span>Overview</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link 
                to="/dashboard/agents" 
                className="flex items-center justify-between text-foreground group w-full px-6"
                onClick={onLinkClick}
              >
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
              <Link 
                to="/dashboard/campaigns" 
                className="flex items-center justify-between text-foreground group w-full px-6"
                onClick={onLinkClick}
              >
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
    </>
  );
};
