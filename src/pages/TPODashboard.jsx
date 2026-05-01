import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import OverviewTab from "./TPODashboard/OverviewTab";
import DrivesTab from "./TPODashboard/DrivesTab";
import ManageDrivesTab from "./TPODashboard/ManageDrivesTab";
import ReportsTab from "./TPODashboard/ReportsTab";
import SettingsTab from "./TPODashboard/SettingsTab";

export default function TPODashboard() {
    return (
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<OverviewTab />} />
          <Route path="/students" element={<OverviewTab />} />
          <Route path="/drives" element={<ManageDrivesTab />} />
          <Route path="/applications" element={<DrivesTab />} />
          <Route path="/reports" element={<ReportsTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </DashboardLayout>
    );
}
