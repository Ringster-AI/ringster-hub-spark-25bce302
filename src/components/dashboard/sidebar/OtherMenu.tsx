import { Settings, CreditCard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface OtherMenuProps {
  onLinkClick?: () => void;
}

export const OtherMenu = ({ onLinkClick }: OtherMenuProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname.startsWith(path);

  const menuItems = [
    { path: "/dashboard/settings", label: "Settings", icon: Settings },
    { path: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-6 mb-1">
        Account
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild tooltip={item.label}>
                <Link 
                  to={item.path} 
                  className={cn(
                    "flex items-center gap-3 w-full px-6 py-2.5 rounded-lg transition-all duration-150",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    isActive(item.path) && [
                      "text-foreground bg-muted",
                      "border-l-2 border-primary ml-0 rounded-l-none"
                    ]
                  )}
                  onClick={onLinkClick}
                >
                  <item.icon className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    isActive(item.path) ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
