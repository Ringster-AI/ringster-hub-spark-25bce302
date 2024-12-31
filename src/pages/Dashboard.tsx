import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Profile from "./Dashboard/Profile";
import Agents from "./Dashboard/Agents";
import Team from "./Dashboard/Team";
import Subscription from "./Dashboard/Subscription";
import Settings from "./Dashboard/Settings";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/agents" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/team" element={<Team />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;