import { Bot, Home, Settings, PieChart, Users, User, CreditCard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", icon: Home, url: "/dashboard" },
  { title: "AI Agents", icon: Bot, url: "/dashboard/agents" },
  { title: "Analytics", icon: PieChart, url: "/dashboard/analytics" },
  { title: "Team", icon: Users, url: "/dashboard/team" },
  { title: "Profile", icon: User, url: "/dashboard/profile" },
  { title: "Subscription", icon: CreditCard, url: "/dashboard/subscription" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

export const DashboardSidebar = () => {
  return (
    <Sidebar>
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
                    <a href={item.url} className="flex items-center gap-2">
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
    </Sidebar>
  );
};