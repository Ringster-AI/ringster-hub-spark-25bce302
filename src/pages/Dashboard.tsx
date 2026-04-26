
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Routes, Route } from "react-router-dom";
import BlogAdmin from "./Dashboard/BlogAdmin";
import NewBlogPost from "./Dashboard/NewBlogPost";
import EditBlogPost from "./Dashboard/EditBlogPost";
import { SidebarProvider } from "@/components/ui/sidebar";
import Overview from "./Dashboard/Overview";
import Agents from "./Dashboard/Agents";
import Campaigns from "./Dashboard/Campaigns";
import CampaignDetails from "./Dashboard/CampaignDetails";
import CampaignDashboard from "./Dashboard/CampaignDashboard";
import Recordings from "./Dashboard/Recordings";
import Analytics from "./Dashboard/Analytics";
import Team from "./Dashboard/Team";
import Settings from "./Dashboard/Settings";
import Subscription from "./Dashboard/Subscription";
import Profile from "./Dashboard/Profile";
import Calendar from "./Dashboard/Calendar";
import LiveCoach from "./Dashboard/LiveCoach";
import { FeedbackDialog } from "@/components/dashboard/FeedbackDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutStatus = params.get("checkout");
    if (!checkoutStatus) return;

    if (checkoutStatus === "success") {
      // Refresh credit balance immediately and keep polling briefly
      // in case the Stripe webhook hasn't finalized yet.
      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["credits"] });
        window.dispatchEvent(new CustomEvent("credits:refresh"));
      };
      refresh();
      const timers = [1500, 4000, 8000].map((ms) => setTimeout(refresh, ms));

      toast({
        title: "Payment successful",
        description: "Your credits will appear shortly.",
      });

      // Clean the URL so refreshes don't retrigger the toast.
      params.delete("checkout");
      navigate(
        { pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" },
        { replace: true }
      );

      return () => timers.forEach(clearTimeout);
    }

    if (checkoutStatus === "cancelled" || checkoutStatus === "canceled") {
      toast({
        title: "Checkout cancelled",
        description: "No changes were made to your account.",
      });
      params.delete("checkout");
      navigate(
        { pathname: location.pathname, search: params.toString() ? `?${params.toString()}` : "" },
        { replace: true }
      );
    }
  }, [location.search, location.pathname, navigate, queryClient, toast]);

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {isMobile && (
            <div className="border-b p-2 flex items-center justify-between bg-background">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <img 
                src="/lovable-uploads/059d2b53-6e4e-4788-a607-2344b4097212.png" 
                alt="Ringster Logo" 
                className="h-8 w-auto"
              />
              <div className="w-5"></div> {/* Empty div for flex spacing */}
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:campaignId" element={<CampaignDetails />} />
              <Route path="/campaigns/:campaignId/dashboard" element={<CampaignDashboard />} />
              <Route path="/recordings" element={<Recordings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/live-coach" element={<LiveCoach />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/team" element={<Team />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/blog" element={<BlogAdmin />} />
              <Route path="/blog/new" element={<NewBlogPost />} />
              <Route path="/blog/edit/:id" element={<EditBlogPost />} />
            </Routes>
          </div>
        </div>
        <FeedbackDialog />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
