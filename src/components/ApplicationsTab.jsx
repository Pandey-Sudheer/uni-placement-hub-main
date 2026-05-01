import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, FileText, Building2, MapPin, IndianRupee, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "@/lib/api";

const appStatusConfig = {
    Applied: { variant: "secondary", icon: Clock },
    Shortlisted: { variant: "warning", icon: FileText },
    Interviewing: { variant: "warning", icon: FileText },
    Offered: { variant: "success", icon: CheckCircle },
};

export default function ApplicationsTab() {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/applications')
            .then(res => {
                setApplications(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (applications.length === 0) {
        return (
            <div className="p-12 mt-12 text-center text-muted-foreground font-semibold glass-card rounded-2xl shadow-sm border border-primary/10">
                You haven't submitted any applications yet. Go to the Job Board to apply!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Your Applications</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">Track the status of your submitted job applications</p>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                {applications.map((app) => {
                    const drive = app.drive;
                    if (!drive) return null; // Handle deleted drives
                    const sc = appStatusConfig[app.status] || { variant: 'secondary', icon: Clock };
                    const StatusIcon = sc.icon;
                    
                    return (
                        <motion.div variants={itemVariants} key={app._id} className="glass-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-6 space-y-4 relative z-10">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">{drive.company}</h3>
                                            <p className="text-sm font-medium text-primary">{drive.role}</p>
                                        </div>
                                    </div>
                                    <Badge variant={sc.variant} className="gap-1.5 shadow-sm">
                                        <StatusIcon className="h-3.5 w-3.5"/> {app.status}
                                    </Badge>
                                </div>

                                {/* Details */}
                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground bg-background/50 p-3 rounded-lg border">
                                    <span className="flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-primary"/>{drive.package}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary"/>{drive.location}</span>
                                    <span className="flex items-center gap-1.5">Submitted: {new Date(app.appliedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
