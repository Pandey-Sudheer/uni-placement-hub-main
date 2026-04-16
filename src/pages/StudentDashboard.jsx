import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Briefcase } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProfileTab from "@/components/ProfileTab";
import JobBoardTab from "@/components/JobBoardTab";
export default function StudentDashboard() {
    return (<DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile and explore placement opportunities</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border shadow-card">
            <TabsTrigger value="profile" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCircle className="h-4 w-4"/> My Profile
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="h-4 w-4"/> Job Board
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="jobs">
            <JobBoardTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>);
}
