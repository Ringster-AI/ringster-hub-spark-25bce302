import { Home, Bot, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CreditDisplay } from "@/components/credits/CreditDisplay";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface MainMenuProps {
  agentCount: number;
  campaignCount: number;
  onLinkClick?: () => void;
}

export const MainMenu = ({ agentCount, campaignCount, onLinkClick }: MainMenuProps) => {
  const location = useLocation();
  
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { path: "/dashboard", label: "Overview", icon: Home, exact: true, count: 0 },
    { path: "/dashboard/agents", label: "AI Agents", icon: Bot, exact: false, count: agentCount },
    { path: "/dashboard/campaigns", label: "Campaigns", icon: Phone, exact: false, count: campaignCount },
  ];

  return (
    <>
      <div className="px-4 py-3">
        <CreditDisplay 
          compact={true}
          onUpgrade={() => {
            window.location.href = '/dashboard/subscription';
          }}
        />
      </div>
      
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-6 mb-1">
          Main Menu
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center justify-between w-full px-6 py-2.5 rounded-lg transition-all duration-150",
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      isActive(item.path, item.exact) && [
                        "text-foreground bg-muted",
                        "border-l-2 border-primary ml-0 rounded-l-none"
                      ]
                    )}
                    onClick={onLinkClick}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-4.5 w-4.5 transition-colors",
                        isActive(item.path, item.exact) ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        isActive(item.path, item.exact)
                          ? "bg-primary/10 text-primary"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      )}>
                        {item.count}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};
