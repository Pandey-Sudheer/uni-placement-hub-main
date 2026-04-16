import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import OverviewTab from "./TPODashboard/OverviewTab";
import DrivesTab from "./TPODashboard/DrivesTab";
import ReportsTab from "./TPODashboard/ReportsTab";

export default function TPODashboard() {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<OverviewTab />} />
          <Route path="/students" element={<OverviewTab />} />
          <Route path="/drives" element={<DrivesTab />} />
          <Route path="/reports" element={<ReportsTab />} />
          <Route path="/settings" element={<div className="p-8 text-center text-muted-foreground">Settings Page</div>} />
        </Routes>
      </DashboardLayout>
    );
}
