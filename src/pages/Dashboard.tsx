import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Profile from "./Dashboard/Profile";
import Agents from "./Dashboard/Agents";
import Team from "./Dashboard/Team";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<div>Dashboard Overview</div>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/team" element={<Team />} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;