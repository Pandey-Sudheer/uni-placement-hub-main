import { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Users, Filter, Briefcase, Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const initialColumnMap = {
  Applied: { name: "Applied", items: [] },
  Shortlisted: { name: "Shortlisted", items: [] },
  Interviewing: { name: "Interviewing", items: [] },
  Offered: { name: "Offered", items: [] }
};

export default function DrivesTab() {
  const [columns, setColumns] = useState(initialColumnMap);
  const [rawApps, setRawApps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fitler States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("All");

  const companies = useMemo(() => {
    const list = rawApps.map(app => app.drive?.company).filter(Boolean);
    return ["All", ...new Set(list)];
  }, [rawApps]);

  const applyFiltersToColumns = (appsToFilter = rawApps, curCompany = filterCompany, curSearch = searchQuery) => {
    const newCols = {
      Applied: { name: "Applied", items: [] },
      Shortlisted: { name: "Shortlisted", items: [] },
      Interviewing: { name: "Interviewing", items: [] },
      Offered: { name: "Offered", items: [] }
    };
    
    appsToFilter.forEach(app => {
      const matchCompany = curCompany === "All" || app.drive?.company === curCompany;
      const matchSearch = app.studentProfile?.name?.toLowerCase().includes(curSearch.toLowerCase());
      
      if(matchCompany && matchSearch && newCols[app.status]) {
        newCols[app.status].items.push(app);
      }
    });
    setColumns(newCols);
  };

  const fetchApplications = () => {
    api.get('/admin/applications').then(res => {
      setRawApps(res.data);
      applyFiltersToColumns(res.data, filterCompany, searchQuery);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast({ title: "Failed to load board", variant: "destructive" });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update columns when filters change
  useEffect(() => {
    if (!loading) applyFiltersToColumns();
  }, [searchQuery, filterCompany]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceCol = columns[source.droppableId];
      const destCol = columns[destination.droppableId];
      const sourceItems = [...sourceCol.items];
      const destItems = [...destCol.items];
      
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems }
      });

      // Update rawApps state so filtering doesn't break
      setRawApps(rawApps.map(a => a._id === removed._id ? { ...a, status: destination.droppableId } : a));

      try {
        await api.put(`/admin/applications/${removed._id}/status`, { status: destination.droppableId });
      } catch (err) {
        toast({ title: "Failed to update status", variant: "destructive" });
        fetchApplications(); // refresh on failure
      }

    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const handleAutoShortlist = async () => {
    const appliedItems = [...columns.Applied.items];
    const updates = [];
    
    // Using the AI Match Score for auto-shortlisting!
    appliedItems.forEach(app => {
      if (app.matchScore >= 80 || (app.studentProfile.cgpa >= 7.5 && app.studentProfile.backlogs === 0)) {
        updates.push(api.put(`/admin/applications/${app._id}/status`, { status: 'Shortlisted' }));
      }
    });

    if(updates.length === 0) {
      toast({ title: "No students met criteria." });
      return;
    }

    try {
      await Promise.all(updates);
      toast({ title: `Shortlisted ${updates.length} candidates using AI Matrix!`, variant: "success" });
      fetchApplications();
    } catch (err) {
      toast({ title: "Error during auto shortlist", variant: "destructive" });
    }
  };

  const getScoreColor = (score) => {
    if (!score) return "bg-muted text-muted-foreground";
    if (score >= 80) return "bg-success/20 text-success border border-success/30";
    if (score >= 50) return "bg-warning/20 text-warning border border-warning/30";
    return "bg-destructive/10 text-destructive border border-destructive/20";
  };

  if (loading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-primary font-bold mb-1">
            <Briefcase className="h-4 w-4" /> Global Applications
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Recruiter ATS Panel</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Manage pipelines and leverage Smart Screening</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-background/50 p-2 rounded-2xl border border-primary/10 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search candidate..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-48 text-sm bg-background"
            />
          </div>
          <select 
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm flex-1 md:w-40 font-medium"
          >
            {companies.map(c => <option key={c} value={c}>{c === "All" ? "All Drives" : c}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={handleAutoShortlist} className="gap-2 font-bold shadow-sm glow-primary border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
            <Sparkles className="h-4 w-4" /> AI Shortlist (&gt;80% Match)
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 pt-2">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex flex-col w-80 shrink-0">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-foreground">{column.name}</h3>
                <span className="bg-primary/10 text-primary text-xs font-extrabold px-2 py-1 rounded-full">{column.items.length}</span>
              </div>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 glass-card rounded-2xl p-3 shadow-inner border border-primary/10 transition-colors ${
                      snapshot.isDraggingOver ? "bg-primary/5" : ""
                    }`}
                  >
                    {column.items.map((app, index) => (
                      <Draggable key={app._id} draggableId={app._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 mb-3 rounded-xl bg-card border shadow-sm transition-shadow ${
                              snapshot.isDragging ? "shadow-lg shadow-primary/20 scale-[1.02]" : "hover:shadow-card-hover"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-bold text-foreground text-sm">{app.studentProfile?.name}</p>
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block truncate max-w-[120px]">
                                      {app.drive?.role} @ {app.drive?.company}
                                    </span>
                                </div>
                                {app.matchScore !== undefined && (
                                  <Badge className={`text-[10px] shrink-0 font-extrabold shadow-sm ${getScoreColor(app.matchScore)}`}>
                                      {app.matchScore}% Match
                                  </Badge>
                                )}
                            </div>
                            
                            <div className="flex gap-2 mb-3 mt-3">
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">CGPA: {app.studentProfile?.cgpa}</span>
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">Backlogs: {app.studentProfile?.backlogs}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {app.studentProfile?.skills && app.studentProfile.skills.slice(0, 3).map(skill => (
                                    <span key={skill} className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{skill}</span>
                                ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
