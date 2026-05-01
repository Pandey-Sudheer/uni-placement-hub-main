import { useState } from "react";
import { Save, Bell, Shield, User, Monitor, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    acceptRegistrations: true,
    emailNotifications: true,
    autoShortlist: false,
    minShortlistCgpa: "7.5",
    adminName: "TPO Admin",
    adminEmail: user?.email || "admin@uniplace.com",
    currentPassword: "",
    newPassword: "",
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (section) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Settings Saved", description: `Your ${section} preferences have been updated successfully.` });
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in ease-out duration-300 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">System Settings</h1>
        <p className="text-muted-foreground font-medium text-sm mt-1">Manage global platform configurations and your admin profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Toggles and Minor Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Appearance */}
          <div className="glass-card p-6 rounded-2xl shadow-card transition-all hover:shadow-card-hover border-t-4 border-t-primary">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
              <Monitor className="h-5 w-5 text-primary" /> Appearance
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Theme Preference</Label>
                <select 
                  value={theme || "system"} 
                  onChange={(e) => setTheme(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>
          </div>

          {/* Global System Preferences */}
          <div className="glass-card p-6 rounded-2xl shadow-card transition-all hover:shadow-card-hover border-t-4 border-t-warning">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-6">
              <Shield className="h-5 w-5 text-warning" /> Global Controls
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Accept Registrations</Label>
                  <p className="text-xs text-muted-foreground">Allow new students to sign up</p>
                </div>
                <Switch checked={settings.acceptRegistrations} onCheckedChange={(v) => handleChange("acceptRegistrations", v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send TPO alerts when students apply</p>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={(v) => handleChange("emailNotifications", v)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Auto-Shortlisting</Label>
                  <p className="text-xs text-muted-foreground">Enable ATS background worker</p>
                </div>
                <Switch checked={settings.autoShortlist} onCheckedChange={(v) => handleChange("autoShortlist", v)} />
              </div>
              
              <Button onClick={() => handleSave("global")} disabled={loading} className="w-full gap-2 mt-4 glow-primary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Controls
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Security */}
        <div className="space-y-6 lg:col-span-2">
          {/* Admin Profile */}
          <div className="glass-card p-6 rounded-2xl shadow-card transition-all hover:shadow-card-hover">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                <User className="h-6 w-6 text-primary" /> Administrator Profile
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Admin Name</Label>
                <Input value={settings.adminName} onChange={(e) => handleChange("adminName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Admin Email (Read Only)</Label>
                <Input value={settings.adminEmail} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>University Name / Branding</Label>
                <Input defaultValue="UniPlace Institute of Technology" />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => handleSave("profile")} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Profile
              </Button>
            </div>
          </div>

          {/* Security & Password */}
          <div className="glass-card p-6 rounded-2xl shadow-card transition-all hover:shadow-card-hover border border-destructive/10">
            <div className="flex items-center gap-2 text-xl font-bold text-destructive mb-6 border-b border-border/50 pb-4">
              <KeyRound className="h-6 w-6" /> Change Password
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave("security"); }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="••••••••" value={settings.currentPassword} onChange={(e) => handleChange("currentPassword", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="••••••••" value={settings.newPassword} onChange={(e) => handleChange("newPassword", e.target.value)} required />
                  <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters long.</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="destructive" disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />} Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
