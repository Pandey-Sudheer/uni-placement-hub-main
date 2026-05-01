import { useState, useRef, useEffect } from "react";
import { Save, Upload, FileText, User, BookOpen, GraduationCap, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import SkillTagCloud from "@/components/SkillTagCloud";
import api from "@/lib/api";

export default function ProfileTab() {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef(null);

    useEffect(() => {
        api.get('/student/profile')
           .then(res => {
               setProfile(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);
    const update = (field, value) => setProfile((p) => ({ ...p, [field]: value }));
    const [uploading, setUploading] = useState(false);

    const handleResume = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
            toast({ title: "Invalid file", description: "Please upload a PDF or Image file.", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Resume must be under 5 MB.", variant: "destructive" });
            return;
        }
        
        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await api.post('/student/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data);
            toast({ title: "Resume uploaded", description: "Your resume has been saved securely." });
        } catch (err) {
            toast({ title: "Upload failed", description: "Could not upload resume to the server.", variant: "destructive" });
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };
    const handleSave = async () => {
        try {
            // Strip out immutable mongo ID and File objects from payload before JSON POST
            const { _id, userId, resumeFile, ...updateData } = profile;
            
            await api.put('/student/profile', updateData);
            setEditing(false);
            toast({ title: "Profile saved", description: "Your changes have been saved to the database." });
        } catch (err) {
            toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
        }
    };
    const Field = ({ label, field, type = "text", disabled = false }) => (<div className="space-y-1.5">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</Label>
      <Input type={type} value={String(profile[field] || "")} onChange={(e) => update(field, type === "number" ? Number(e.target.value) : e.target.value)} disabled={!editing || disabled} className="disabled:opacity-70 bg-background/50 border-primary/20 focus-visible:ring-primary/30"/>
    </div>);

    const requiredChecks = profile ? [
        !!profile.name,
        !!profile.phone,
        !!profile.department,
        !!profile.graduationYear,
        profile.cgpa !== undefined && profile.cgpa !== null && profile.cgpa !== "",
        profile.tenthMarks !== undefined && profile.tenthMarks !== null && profile.tenthMarks !== "",
        profile.twelfthMarks !== undefined && profile.twelfthMarks !== null && profile.twelfthMarks !== "",
        profile.backlogs !== undefined && profile.backlogs !== null && profile.backlogs !== "",
        profile.skills?.length > 0,
        !!profile.resumeName
    ] : [];
    const filledCount = requiredChecks.filter(Boolean).length;
    const completionPercentage = profile ? Math.round((filledCount / requiredChecks.length) * 100) : 0;

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!profile) return <div>Failed to load profile.</div>;

    return (<div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">My Profile</h2>
        {editing ? (<div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="rounded-full">Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5 rounded-full glow-primary">
              <Save className="h-4 w-4"/> Save Changes
            </Button>
          </div>) : (<Button size="sm" onClick={() => setEditing(true)} className="rounded-full shadow-sm hover:scale-105 transition-transform">Edit Profile</Button>)}
      </div>

      {/* Completion Progress Bar */}
      <div className="glass-card rounded-2xl p-6 shadow-card space-y-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
        <div className="relative z-10 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${completionPercentage === 100 ? "text-warning" : "text-primary"}`} />
                <span className="font-bold text-foreground">Profile Completeness</span>
            </div>
            <span className="font-bold text-primary text-xl">{completionPercentage}%</span>
        </div>
        <div className="relative h-3 w-full bg-primary/10 rounded-full overflow-hidden z-10 border border-primary/20">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${completionPercentage}%` }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-primary rounded-full"
            />
        </div>
        {completionPercentage < 100 && (
            <p className="text-xs text-muted-foreground relative z-10">Complete your profile to 100% to increase shortlisting chances.</p>
        )}
      </div>

      {/* Personal Details */}
      {/* Personal Details */}
      <div className="glass-card rounded-2xl p-6 shadow-card space-y-5 transition-all hover:shadow-card-hover">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg border-b border-border/50 pb-3">
          <User className="h-5 w-5 text-primary"/> Personal Details
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name" field="name"/>
          <Field label="Email" field="email" disabled/>
          <Field label="Phone" field="phone"/>
          <Field label="Department" field="department"/>
          <Field label="Roll Number" field="rollNumber" disabled/>
          <Field label="Graduation Year" field="graduationYear" type="number"/>
        </div>
      </div>

      {/* Academic Marks */}
      <div className="glass-card rounded-2xl p-6 shadow-card space-y-5 transition-all hover:shadow-card-hover">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg border-b border-border/50 pb-3">
          <BookOpen className="h-5 w-5 text-primary"/> Academic Details
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="CGPA" field="cgpa" type="number"/>
          <Field label="10th Marks (%)" field="tenthMarks" type="number"/>
          <Field label="12th Marks (%)" field="twelfthMarks" type="number"/>
          <Field label="Active Backlogs" field="backlogs" type="number"/>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card rounded-2xl p-6 shadow-card space-y-5 transition-all hover:shadow-card-hover">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg border-b border-border/50 pb-3">
          <GraduationCap className="h-5 w-5 text-primary"/> Skills
        </div>
        {editing ? (<SkillTagCloud selected={profile.skills} onChange={(skills) => update("skills", skills)}/>) : (<div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (<span key={s} className="rounded-lg bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 text-xs font-bold">{s}</span>))}
          </div>)}
      </div>

      {/* Resume */}
      <div className="glass-card rounded-2xl p-6 shadow-card space-y-5 transition-all hover:shadow-card-hover">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg border-b border-border/50 pb-3">
          <FileText className="h-5 w-5 text-primary"/> Resume
        </div>
        <input ref={fileRef} type="file" accept=".pdf,image/jpeg,image/png,image/jpg" className="hidden" onChange={handleResume}/>
        <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-primary/10">
          {uploading ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-foreground px-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p>Uploading securely...</p>
            </div>
          ) : profile.resumeName ? (<div className="flex items-center gap-3 text-sm font-semibold text-foreground px-2">
              <div className="h-10 w-10 bg-primary/20 flex items-center justify-center rounded-lg">
                <FileText className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <p>{profile.resumeName}</p>
                <div className="flex gap-2 items-center">
                    <p className="text-xs text-success font-medium">✅ Uploaded & Ready</p>
                    {profile.resumeUrl && (
                        <a href={`http://localhost:5000${profile.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">
                            View Resume
                        </a>
                    )}
                </div>
              </div>
            </div>) : (<p className="text-sm font-medium text-muted-foreground px-2">No resume uploaded yet.</p>)}
          <Button variant={profile.resumeName ? "outline" : "default"} size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="ml-auto gap-2 rounded-full">
            <Upload className="h-4 w-4"/> {uploading ? "Uploading..." : profile.resumeName ? "Replace file" : "Upload File"}
          </Button>
        </div>
      </div>
    </div>);
}
