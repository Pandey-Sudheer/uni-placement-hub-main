import { useState, useEffect, useMemo } from "react";
import { Globe2, Briefcase, ExternalLink, MapPin, IndianRupee, Clock, Loader2, Sparkles, AlertCircle, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function GlobalJobsTab() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 12;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    // Fetch from multiple APIs simultaneously
    Promise.allSettled([
      fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=100').then(res => res.json()),
      fetch('https://www.arbeitnow.com/api/job-board-api').then(res => res.json())
    ]).then(([remotiveRes, arbeitnowRes]) => {
      let combinedJobs = [];

      // Process Remotive Jobs
      if (remotiveRes.status === 'fulfilled' && remotiveRes.value && remotiveRes.value.jobs) {
        combinedJobs = [...combinedJobs, ...remotiveRes.value.jobs.map(job => ({
            id: `rem_${job.id}`,
            title: job.title,
            company_name: job.company_name,
            company_logo_url: job.company_logo_url,
            candidate_required_location: job.candidate_required_location || "Remote Worldwide",
            salary: job.salary || "Not Disclosed",
            publication_date: job.publication_date,
            job_type: job.job_type || "software_dev",
            url: job.url
        }))];
      }

      // Process Arbeitnow Jobs
      if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value && arbeitnowRes.value.data) {
        combinedJobs = [...combinedJobs, ...arbeitnowRes.value.data.map(job => ({
            id: `arb_${job.slug}`,
            title: job.title,
            company_name: job.company_name,
            company_logo_url: null, // Arbeitnow doesn't provide standard logos
            candidate_required_location: job.location || (job.remote ? "Remote" : "Global"),
            salary: "Not Disclosed",
            publication_date: new Date(job.created_at * 1000).toISOString(),
            job_type: "full_time",
            url: job.url
        }))];
      }

      // Sort by newest
      combinedJobs.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
      
      setAllJobs(combinedJobs);
      setLoading(false);
    }).catch(err => {
      console.error("Multi-API Fetch Error:", err);
      setError("Could not connect to external job networks.");
      setLoading(false);
    });
  }, []);

  // Compute Filtered Array
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      // Search logic (Title, company name, checking for "Intern", "Junior")
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Location logic
      const matchesLoc = job.candidate_required_location?.toLowerCase().includes(locationQuery.toLowerCase());

      // Type logic
      let matchesType = true;
      if (filterType === 'internship') {
        matchesType = job.job_type === 'internship' || job.title.toLowerCase().includes('intern');
      } else if (filterType === 'full_time') {
        matchesType = job.job_type === 'full_time' && !job.title.toLowerCase().includes('intern');
      } else if (filterType === 'contract') {
        matchesType = job.job_type === 'contract' || job.job_type === 'freelance';
      }

      return matchesSearch && matchesLoc && matchesType;
    });
  }, [allJobs, searchQuery, locationQuery, filterType]);

  // Pagination bounds resetting when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationQuery, filterType]);

  // Compute paginated slice
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const currentJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold animate-pulse">Connecting to global job market...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 mt-12 glass-card rounded-3xl border border-destructive/20 bg-destructive/5 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Network Error</h3>
        <p className="text-muted-foreground font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
            <Globe2 className="h-4 w-4" /> Off-Campus Opportunities
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Global Job Market</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Live, real-time remote tech jobs fetched securely.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 shadow-sm bg-primary/5 border-primary/20 text-primary shrink-0">
          <Sparkles className="h-4 w-4" /> {filteredJobs.length} Matches Found
        </Badge>
      </motion.div>

      {/* Advanced Filters Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-2xl border border-primary/20 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search role, skills, or 'Fresher'..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
        <div className="relative w-full lg:w-1/3">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter Location (e.g. India, Worldwide)..." 
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-1/3">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-10 px-3 w-full rounded-md border border-input bg-background/50 text-sm font-medium focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Job Types</option>
            <option value="full_time">Full-Time (Experienced)</option>
            <option value="internship">Internship / Fresher</option>
            <option value="contract">Contract / Freelance</option>
          </select>
        </div>
      </motion.div>

      {filteredJobs.length === 0 ? (
        <div className="text-center p-12 glass-card rounded-2xl border border-border/50">
           <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
           <p className="text-muted-foreground font-bold text-lg">No positions match your exact filters.</p>
           <Button variant="link" onClick={() => {setSearchQuery(''); setLocationQuery(''); setFilterType('all');}}>Clear all filters</Button>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[500px] content-start"
          >
            {currentJobs.map((job) => (
              <motion.div variants={itemVariants} key={job.id} className="glass-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden relative group border border-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 space-y-4 relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {job.company_logo_url ? (
                          <img src={job.company_logo_url} alt={job.company_name} className="h-12 w-12 object-contain bg-white rounded-xl border border-border/50 p-1 shrink-0" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-foreground line-clamp-1" title={job.title}>{job.title}</h3>
                          <p className="text-sm font-bold text-primary">{job.company_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="success" className="whitespace-nowrap shadow-sm capitalize animate-pulse bg-success/20 text-success border-success/30">
                          Active
                        </Badge>
                        <Badge variant="secondary" className="whitespace-nowrap capitalize shadow-sm">
                          {job.job_type ? job.job_type.replace(/_/g, ' ') : "Software"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50 mb-4 shadow-inner">
                      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary"/>{job.candidate_required_location || "Worldwide"}</span>
                      {job.salary && <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-success"/>{job.salary}</span>}
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-warning"/>Posted: {new Date(job.publication_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-between items-center border-t border-border/50">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      External Portal
                    </span>
                    <Button asChild size="sm" className="rounded-full gap-2 glow-primary shadow-sm hover:scale-105 transition-transform">
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        Apply Now <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between glass-card p-4 rounded-xl border border-primary/20 shadow-sm mt-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Showing <span className="text-foreground">{(currentPage - 1) * jobsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * jobsPerPage, filteredJobs.length)}</span> of <span className="text-foreground">{filteredJobs.length}</span> entries
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1 font-bold"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    // Show pages around current
                    let pageNum = currentPage;
                    if (currentPage <= 3) pageNum = idx + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
                    else pageNum = currentPage - 2 + idx;
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 font-bold ${currentPage === pageNum ? "glow-primary pointer-events-none" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1 font-bold"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
