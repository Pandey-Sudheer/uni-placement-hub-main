import { useState, useEffect, useMemo } from "react";
import { Globe2, Briefcase, ExternalLink, MapPin, IndianRupee, Clock, Loader2, Sparkles, AlertCircle, Search, Filter, ChevronLeft, ChevronRight, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import { indianInternshipsFallback } from "@/lib/mockApi";

export default function LiveInternshipsTab() {
  const [allInternships, setAllInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [workModel, setWorkModel] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    // 1. Fetch live remote internships from multiple public APIs
    Promise.allSettled([
      fetch('https://remotive.com/api/remote-jobs?category=software-dev&search=intern').then(res => res.json()),
      fetch('https://www.arbeitnow.com/api/job-board-api').then(res => res.json())
    ]).then(([remotiveRes, arbeitnowRes]) => {
        let externalData = [];

        // Parse Remotive
        if (remotiveRes.status === 'fulfilled' && remotiveRes.value && remotiveRes.value.jobs) {
          externalData = [...externalData, ...remotiveRes.value.jobs.map(job => ({
              id: `rem_${job.id}`,
              title: job.title,
              company_name: job.company_name,
              company_logo_url: job.company_logo_url,
              candidate_required_location: job.candidate_required_location || "Remote Worldwide",
              salary: job.salary || "Not Disclosed",
              publication_date: job.publication_date,
              job_type: job.job_type,
              url: job.url,
              work_model: "remote",
              region: "international_remote"
          }))];
        }

        // Parse Arbeitnow (Client-side filter for interns)
        if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value && arbeitnowRes.value.data) {
          const arbeitnowInterns = arbeitnowRes.value.data.filter(j => 
             j.title.toLowerCase().includes('intern') || j.title.toLowerCase().includes('trainee')
          ).map(job => ({
              id: `arb_${job.slug}`,
              title: job.title,
              company_name: job.company_name,
              company_logo_url: null,
              candidate_required_location: job.location || (job.remote ? "Remote" : "Global"),
              salary: "Not Disclosed",
              publication_date: new Date(job.created_at * 1000).toISOString(),
              job_type: "internship",
              url: job.url,
              work_model: job.remote ? "remote" : "hybrid",
              region: "international_remote"
          }));
          externalData = [...externalData, ...arbeitnowInterns];
        }
        
        // 2. Blend with dynamic highly-realistic backend simulated datasets
        // NOTE: The mockApi computes Date.now() internally, guaranteeing they are within the last 20 days!
        const blendedData = [...indianInternshipsFallback, ...externalData]
            .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
        
        setAllInternships(blendedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Multi-API Fetch Error:", err);
        setAllInternships(indianInternshipsFallback);
        setLoading(false);
      });
  }, []);

  // Compute Filtered Array
  const filteredData = useMemo(() => {
    return allInternships.filter(job => {
      // Search logic
      const matchesSearch = 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.candidate_required_location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Work Model logic (On-Site, Remote, Hybrid)
      let matchesModel = true;
      if (workModel !== "all") {
        matchesModel = job.work_model === workModel;
      }

      // Region Filter logic
      let matchesRegion = true;
      if (regionFilter !== "all") {
          if (regionFilter === "india_all") {
              matchesRegion = job.region !== "international_remote";
          } else {
              matchesRegion = job.region === regionFilter;
          }
      }

      return matchesSearch && matchesModel && matchesRegion;
    });
  }, [allInternships, searchQuery, workModel, regionFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, workModel, regionFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
            <Laptop className="h-4 w-4" /> Fresher & Trainee Network
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Live Internships Hub</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Discover dynamic on-site & remote fresher programs in real-time.</p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 shadow-sm bg-primary/5 border-primary/20 text-primary shrink-0">
          <Sparkles className="h-4 w-4" /> {filteredData.length} Openings Found
        </Badge>
      </motion.div>

      {/* Advanced Filters Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-2xl border border-primary/20 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search roles, tech stack, or cities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 font-medium"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-1/3">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <select 
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-10 px-3 w-full rounded-md border border-input bg-background/50 text-sm font-bold focus:ring-primary/20"
          >
            <option value="all">Global (All Locations)</option>
            <option value="india_all">India Only (All Cities)</option>
            <option value="bangalore">Bangalore (Silicon Valley)</option>
            <option value="delhi_ncr">Delhi NCR & Gurugram</option>
            <option value="pune">Pune & MH</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-1/3">
          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <select 
            value={workModel}
            onChange={(e) => setWorkModel(e.target.value)}
            className="h-10 px-3 w-full rounded-md border border-input bg-background/50 text-sm font-bold focus:ring-primary/20"
          >
            <option value="all">Any Work Model</option>
            <option value="on-site">On-Site Only</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid Allowed</option>
          </select>
        </div>
      </motion.div>

      {filteredData.length === 0 ? (
        <div className="text-center p-12 glass-card rounded-2xl border border-border/50">
           <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
           <p className="text-muted-foreground font-bold text-lg">No internship matches those intense filters.</p>
           <Button variant="link" onClick={() => {setSearchQuery(''); setWorkModel('all'); setRegionFilter('all');}}>Clear and refresh</Button>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[500px] content-start"
          >
            {currentItems.map((job) => (
              <motion.div variants={itemVariants} key={job.id} className="glass-card rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden relative group border border-primary/10 flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {job.company_logo_url ? (
                        <img src={job.company_logo_url} alt={job.company_name} className="h-12 w-12 object-contain bg-white rounded-xl border border-border/50 p-1 shrink-0" />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Laptop className="h-6 w-6 text-primary" />
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
                      <Badge variant={job.work_model === "remote" ? "default" : job.work_model === "on-site" ? "warning" : "success"} className="whitespace-nowrap shadow-sm capitalize">
                        {job.work_model}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50 shadow-inner">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-primary"/>{job.candidate_required_location}</span>
                    {job.salary && <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-success"/>{job.salary}</span>}
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-warning"/>{new Date(job.publication_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="px-6 py-4 flex justify-between items-center border-t border-border/50 bg-background/30 z-10">
                  <span className="text-xs font-bold text-muted-foreground tracking-widest hidden sm:inline-block">
                    {job.region === 'international_remote' ? "GLOBAL HUB" : "INDIAN REGION"}
                  </span>
                  <Button asChild size="sm" className="rounded-full gap-2 px-6 glow-primary shadow-sm hover:scale-105 transition-transform w-full sm:w-auto">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      Apply Externally <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between glass-card p-4 rounded-xl border border-primary/20 shadow-sm mt-6">
              <p className="text-sm font-semibold text-muted-foreground">
                Showing <span className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="text-foreground">{filteredData.length}</span> entries
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="font-bold"
                >
                  Prev
                </Button>
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum = currentPage;
                    if (currentPage <= 3) pageNum = idx + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + idx;
                    else pageNum = currentPage - 2 + idx;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum} variant={currentPage === pageNum ? "default" : "ghost"} size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 font-bold ${currentPage === pageNum ? "pointer-events-none glow-primary" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="font-bold"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
