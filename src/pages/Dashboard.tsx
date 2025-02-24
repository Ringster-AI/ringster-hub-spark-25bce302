
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Routes, Route } from "react-router-dom";
import BlogAdmin from "./Dashboard/BlogAdmin";
import NewBlogPost from "./Dashboard/NewBlogPost";
import EditBlogPost from "./Dashboard/EditBlogPost";
import { SidebarProvider } from "@/components/ui/sidebar";
import Overview from "./Dashboard/Overview";
import Agents from "./Dashboard/Agents";
import Campaigns from "./Dashboard/Campaigns";
import Recordings from "./Dashboard/Recordings";
import Analytics from "./Dashboard/Analytics";
import Team from "./Dashboard/Team";
import Settings from "./Dashboard/Settings";
import Subscription from "./Dashboard/Subscription";
import Profile from "./Dashboard/Profile";
import { FeedbackDialog } from "@/components/dashboard/FeedbackDialog";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/recordings" element={<Recordings />} />
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
        <FeedbackDialog />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
