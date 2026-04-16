import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }) {
    const { isAuthenticated } = useAuth();
    const { theme, setTheme } = useTheme();

    if (!isAuthenticated)
        return <Navigate to="/" replace/>;

    return (<SidebarProvider>
      <div className="min-h-screen flex w-full bg-mesh-gradient overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between glass-card m-4 rounded-xl px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4"/>
              <span className="text-sm font-bold text-foreground">Placement Portal</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full hover:bg-primary/20">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </header>
          <main className="flex-1 p-6 pt-0 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>);
}
