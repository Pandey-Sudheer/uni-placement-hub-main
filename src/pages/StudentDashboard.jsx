import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfileTab from "@/components/ProfileTab";
import JobBoardTab from "@/components/JobBoardTab";
import ApplicationsTab from "@/components/ApplicationsTab";
import NotificationsTab from "@/components/NotificationsTab";
import GlobalJobsTab from "./StudentDashboard/GlobalJobsTab";
import LiveInternshipsTab from "./StudentDashboard/LiveInternshipsTab";

export default function StudentDashboard() {
    return (
      <DashboardLayout>
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          <Routes>
            <Route path="/" element={<ProfileTab />} />
            <Route path="/jobs" element={<JobBoardTab type="Full-Time" />} />
            <Route path="/internships" element={<LiveInternshipsTab />} />
            <Route path="/global-jobs" element={<GlobalJobsTab />} />
            <Route path="/applications" element={<ApplicationsTab />} />
            <Route path="/notifications" element={<NotificationsTab />} />
          </Routes>
        </div>
      </DashboardLayout>
    );
}
