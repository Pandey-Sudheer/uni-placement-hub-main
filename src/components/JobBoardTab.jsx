import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, IndianRupee, CheckCircle, XCircle, Clock, Building2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

function checkEligibility(profile, drive) {
    if (!profile) return { eligible: false, reason: "Loading profile..." };
    if (profile.cgpa < drive.minCgpa)
        return { eligible: false, reason: `Requires ${drive.minCgpa}+ CGPA` };
    if (profile.backlogs > drive.maxBacklogs)
        return { eligible: false, reason: `Max ${drive.maxBacklogs} backlogs allowed` };
    return { eligible: true, reason: "You're eligible!" };
}

const statusConfig = {
    Upcoming: { variant: "warning", icon: Clock },
    Ongoing: { variant: "success", icon: CheckCircle },
    Completed: { variant: "secondary", icon: XCircle },
};

export default function JobBoardTab({ type = "All" }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    const [drives, setDrives] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/student/drives'),
            api.get('/student/profile')
        ]).then(([drivesRes, profileRes]) => {
            setDrives(drivesRes.data);
            setProfile(profileRes.data);
            setLoading(false);
        }).catch(console.error);
    }, []);

    const handleApply = async (e, driveId) => {
        try {
            await api.post(`/student/apply/${driveId}`);
            toast({ title: "Application sent!", description: "Check status in tracking tab." });
            setDrives(drives.map(d => d._id === driveId ? { ...d, hasApplied: true } : d));
            
            const rect = e.target.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            
            confetti({
                particleCount: 100, spread: 70, origin: { x, y },
                colors: ['#2563eb', '#10b981', '#f59e0b', '#3b82f6']
            });
        } catch (err) {
            toast({ title: "Failed to apply", description: err.response?.data?.msg || "Error", variant: "destructive" });
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    
    // Filter drives by type before paginating!
    const filteredDrives = drives.filter(d => (type === "All" || d.employmentType === type) && d.status !== "Completed");

    const totalPages = Math.ceil(filteredDrives.length / itemsPerPage);
    const currentData = filteredDrives.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          {type === "Internship" ? "Internship Board" : type === "Full-Time" ? "Full-Time Jobs" : "Job Board"}
        </h2>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          {type === "Internship" ? "Exclusive internship opportunities for students" : "Upcoming company visits and placement drives"}
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {currentData.map((drive) => {
            const { eligible, reason } = checkEligibility(profile, drive);
            const sc = statusConfig[drive.status] || { variant: 'secondary', icon: Clock };
            const StatusIcon = sc.icon;
            return (<motion.div variants={itemVariants} key={drive.id} className="glass-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 space-y-4 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Building2 className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{drive.company}</h3>
                      <p className="text-sm font-medium text-primary">{drive.role}</p>
                    </div>
                  </div>
                  <Badge variant={sc.variant} className="gap-1.5 shadow-sm">
                    <StatusIcon className="h-3.5 w-3.5"/> {drive.status}
                  </Badge>
                </div>

                {/* Details */}
                <p className="text-sm text-foreground/80 leading-relaxed min-h-[40px]">{drive.description}</p>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground bg-background/50 p-3 rounded-lg border">
                  <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-primary"/>{drive.package}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary"/>{drive.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary"/>{drive.date}</span>
                </div>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {drive.requiredSkills.map((s) => (<span key={s} className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">{s}</span>))}
                </div>

                {/* Eligibility */}
                <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border shadow-sm mt-4 ${eligible ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}`}>
                  <div className="flex items-center gap-2.5">
                    {eligible ? (<CheckCircle className="h-5 w-5 text-success"/>) : (<XCircle className="h-5 w-5 text-destructive"/>)}
                    <span className={eligible ? "text-success font-bold" : "text-destructive font-bold"}>
                      {reason}
                    </span>
                  </div>
                  {drive.hasApplied ? (
                      <Button size="sm" variant="outline" disabled className="h-8 px-4 text-xs font-bold gap-1 mt-0 shadow-none"><CheckCircle className="h-3 w-3" /> Applied</Button>
                  ) : eligible && drive.status !== "Completed" && (
                      <Button size="sm" onClick={(e) => handleApply(e, drive._id)} className="h-8 px-4 text-xs font-bold glow-primary hover:scale-105 transition-transform active:scale-95">Apply Now</Button>
                  )}
                </div>
              </div>
            </motion.div>);
        })}
      </motion.div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-xs font-semibold text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, drives.length)} of {drives.length} active drives
          </p>
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-bold text-foreground mx-2">
                Page {currentPage} of {totalPages}
            </span>
            <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>);
}
