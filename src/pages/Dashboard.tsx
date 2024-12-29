import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Profile from "./Dashboard/Profile";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<div>Dashboard Overview</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/agents" element={<div>AI Agents</div>} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/team" element={<div>Team</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;