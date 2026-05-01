import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import OverviewTab from "./TPODashboard/OverviewTab"; // Reuse the overview style

export default function RecruiterDashboard() {
    return (
      <DashboardLayout>
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Company Partner Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your active recruitment drives and review applicants securely.</p>
          </div>
          
          <Routes>
            <Route path="/" element={<OverviewTab />} />
            {/* The full features would be mounted here like <RecruiterManageDrives /> and <RecruiterATS /> */}
            <Route path="/drives" element={<div className="glass-card p-12 text-center font-bold text-lg border-primary/20 bg-background text-primary">Manage Your Company Drives (Locked to your Access)</div>} />
            <Route path="/applications" element={<div className="glass-card p-12 text-center font-bold text-lg border-primary/20 bg-background text-primary">Company ATS Pipeline (Locked to your Access)</div>} />
          </Routes>
        </div>
      </DashboardLayout>
    );
}
