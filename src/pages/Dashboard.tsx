
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Routes, Route } from "react-router-dom";
import BlogAdmin from "./Dashboard/BlogAdmin";
import NewBlogPost from "./Dashboard/NewBlogPost";
import EditBlogPost from "./Dashboard/EditBlogPost";
import { SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<div>Dashboard Home</div>} />
            <Route path="/profile" element={<div>Profile</div>} />
            <Route path="/settings" element={<div>Settings</div>} />
            <Route path="/blog" element={<BlogAdmin />} />
            <Route path="/blog/new" element={<NewBlogPost />} />
            <Route path="/blog/edit/:id" element={<EditBlogPost />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
