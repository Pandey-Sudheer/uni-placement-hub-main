import { LayoutDashboard, Users, Briefcase, FileText, Settings, LogOut, GraduationCap, UserCircle, Building2, Bell, } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
const tpoItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Student Directory", url: "/dashboard/students", icon: Users },
    { title: "Placement Drives", url: "/dashboard/drives", icon: Briefcase },
    { title: "Reports", url: "/dashboard/reports", icon: FileText },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
];
const studentItems = [
    { title: "My Profile", url: "/student", icon: UserCircle },
    { title: "Job Listings", url: "/student/jobs", icon: Building2 },
    { title: "Applications", url: "/student/applications", icon: FileText },
    { title: "Notifications", url: "/student/notifications", icon: Bell },
];
export function AppSidebar() {
    const { role, logout } = useAuth();
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const location = useLocation();
    const navigate = useNavigate();
    const items = role === "tpo" ? tpoItems : studentItems;
    const currentPath = location.pathname;
    const handleLogout = () => {
        logout();
        navigate("/");
    };
    return (<Sidebar collapsible="icon" className="border-r-0 m-4 rounded-xl glass-card h-[calc(100vh-2rem)] shadow-lg !bg-transparent">
      <SidebarContent className="bg-transparent">
        {/* Brand */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl glow-primary flex items-center justify-center shrink-0 bg-primary border-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground"/>
          </div>
          {!collapsed && (<div>
              <p className="text-lg font-bold text-foreground">UniPlace</p>
              <p className="text-xs text-primary font-medium">{role === "tpo" ? "TPO Panel" : "Student Panel"}</p>
            </div>)}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-bold uppercase tracking-widest pl-5 mb-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 px-2">
              {items.map((item) => (<SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-primary/10 hover:text-primary transition-colors rounded-lg">
                    <NavLink to={item.url} end activeClassName="bg-primary/15 text-primary font-semibold shadow-sm rounded-lg">
                      <item.icon className="mr-3 h-5 w-5"/>
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-transparent border-t border-border/50">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg" onClick={handleLogout}>
          <LogOut className="mr-3 h-5 w-5"/>
          {!collapsed && <span className="font-semibold text-sm">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>);
}
