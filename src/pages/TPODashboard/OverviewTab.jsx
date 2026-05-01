import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Users, CheckCircle, Briefcase, Filter, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import api from "@/lib/api";

const statusVariant = {
    Placed: "success",
    Unplaced: "destructive",
    Shortlisted: "warning",
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card rounded-2xl p-6 shadow-card hover:shadow-card-hover flex items-center gap-4 transition-all"
  >
    <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="h-7 w-7"/>
    </div>
    <div>
      <p className="text-3xl font-extrabold text-foreground">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  </motion.div>
);

export default function OverviewTab() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/students').then(res => {
            setStudents(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const [search, setSearch] = useState("");
    const [cgpaFilter, setCgpaFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");
    const [backlogFilter, setBacklogFilter] = useState("all");
    const [skillFilter, setSkillFilter] = useState("all");

    const allSkills = useMemo(() => [...new Set(students.flatMap((s) => s.skills || []))].sort(), [students]);

    const filtered = useMemo(() => {
        return students.filter((s) => {
            const nameTarget = s?.name || "Unknown";
            const emailTarget = s?.email || "Unknown";
            const searchStr = search || "";
            
            const matchSearch = nameTarget.toLowerCase().includes(searchStr.toLowerCase()) || 
                                emailTarget.toLowerCase().includes(searchStr.toLowerCase());
            const matchCgpa = cgpaFilter === "all" || (cgpaFilter === "9+" && s.cgpa >= 9) || (cgpaFilter === "8+" && s.cgpa >= 8) || (cgpaFilter === "7+" && s.cgpa >= 7) || (cgpaFilter === "<7" && s.cgpa < 7);
            const matchYear = yearFilter === "all" || s.graduationYear === Number(yearFilter);
            const matchBacklog = backlogFilter === "all" || (backlogFilter === "none" && s.backlogs === 0) || (backlogFilter === "has" && s.backlogs > 0);
            const matchSkill = skillFilter === "all" || (s.skills || []).includes(skillFilter);
            return matchSearch && matchCgpa && matchYear && matchBacklog && matchSkill;
        });
    }, [search, cgpaFilter, yearFilter, backlogFilter, skillFilter, students]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, cgpaFilter, yearFilter, backlogFilter, skillFilter]);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const placedCount = students.filter((s) => s.status === "Placed").length;
    const hasFilters = cgpaFilter !== "all" || yearFilter !== "all" || backlogFilter !== "all" || skillFilter !== "all";

    const clearFilters = () => {
        setCgpaFilter("all");
        setYearFilter("all");
        setBacklogFilter("all");
        setSkillFilter("all");
        setSearch("");
    };

    if (loading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">System Overview</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Manage global student data and high-level metrics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Students" value={students.length} color="bg-primary/20 text-primary border border-primary/20"/>
          <StatCard icon={CheckCircle} label="Placed Students" value={placedCount} color="bg-success/20 text-success border border-success/20"/>
          <StatCard icon={Briefcase} label="Active Drives" value={5} color="bg-warning/20 text-warning border border-warning/20"/>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl border border-primary/20">
                  <Filter className="h-5 w-5 text-primary"/>
              </div>
              <h2 className="font-bold text-lg text-foreground">Global Student Directory</h2>
            </div>
            {hasFilters && (<Button variant="outline" size="sm" onClick={clearFilters} className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-1.5 rounded-full">
                <X className="h-3.5 w-3.5"/> Clear filters
              </Button>)}
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              <Input placeholder="Search students by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-background/50 border-primary/10 h-11"/>
            </div>
            <Select value={cgpaFilter} onValueChange={setCgpaFilter}>
              <SelectTrigger className="w-full lg:w-36 h-11 bg-background/50 border-primary/10"><SelectValue placeholder="CGPA"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CGPA</SelectItem>
                <SelectItem value="9+">9.0+</SelectItem>
                <SelectItem value="8+">8.0+</SelectItem>
                <SelectItem value="7+">7.0+</SelectItem>
                <SelectItem value="<7">Below 7</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full lg:w-40 h-11 bg-background/50 border-primary/10"><SelectValue placeholder="Skills"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {allSkills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full lg:w-36 h-11 bg-background/50 border-primary/10"><SelectValue placeholder="Year"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <Select value={backlogFilter} onValueChange={setBacklogFilter}>
              <SelectTrigger className="w-full lg:w-40 h-11 bg-background/50 border-primary/10"><SelectValue placeholder="Backlogs"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Backlogs</SelectItem>
                <SelectItem value="none">No Backlogs</SelectItem>
                <SelectItem value="has">Has Backlogs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-primary/10 overflow-hidden bg-background/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 hover:bg-primary/5">
                  <TableHead className="font-bold text-primary">Name</TableHead>
                  <TableHead className="font-bold text-primary">Email</TableHead>
                  <TableHead className="text-center font-bold text-primary">CGPA</TableHead>
                  <TableHead className="text-center font-bold text-primary">Year</TableHead>
                  <TableHead className="text-center font-bold text-primary">Backlogs</TableHead>
                  <TableHead className="text-center font-bold text-primary">Status</TableHead>
                  <TableHead className="text-center font-bold text-primary">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length === 0 ? (<TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground font-medium">
                      No students match the current filters. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>) : (currentData.map((student) => (<TableRow key={student.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="font-bold text-foreground">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{student.email}</TableCell>
                      <TableCell className="text-center font-bold text-foreground">{student.cgpa}</TableCell>
                      <TableCell className="text-center text-muted-foreground font-medium">{student.graduationYear}</TableCell>
                      <TableCell className="text-center font-medium">{student.backlogs}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant[student.status]} className="shadow-sm">{student.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-full font-bold">
                          <FileText className="h-4 w-4"/> View
                        </Button>
                      </TableCell>
                    </TableRow>)))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-2 pt-2">
            <p className="text-xs font-semibold text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} students
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
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
}
