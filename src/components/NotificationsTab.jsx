import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

const typeConfig = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
    success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" }
};

export default function NotificationsTab() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = () => {
        api.get('/student/notifications')
            .then(res => {
                setNotifications(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/student/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    if (notifications.length === 0) {
        return (
            <div className="p-12 mt-12 text-center text-muted-foreground font-semibold glass-card rounded-2xl shadow-sm border border-primary/10">
                You have no notifications yet!
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                    <Bell className="h-6 w-6 text-primary" /> Notifications
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">Updates on your applications and placement drives</p>
            </motion.div>

            <div className="space-y-4">
                {notifications.map((notif, index) => {
                    const config = typeConfig[notif.type] || typeConfig.info;
                    const Icon = config.icon;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={notif._id} 
                            className={`glass-card p-4 rounded-xl flex items-start gap-4 transition-all ${notif.isRead ? 'opacity-70' : 'border-l-4 border-l-primary shadow-sm background-primary/5'}`}
                        >
                            <div className={`shrink-0 rounded-full p-2 ${config.bg} ${config.color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold ${notif.isRead ? 'text-foreground/80' : 'text-foreground'}`}>
                                        {notif.title}
                                        {!notif.isRead && <Badge variant="default" className="ml-2 text-[10px] h-4 py-0 px-1.5">New</Badge>}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/80 mt-1">{notif.message}</p>
                                
                                {!notif.isRead && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => markAsRead(notif._id)}
                                        className="h-8 text-xs font-bold mt-2 px-3 text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
