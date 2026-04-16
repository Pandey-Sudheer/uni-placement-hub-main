import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Users, Filter, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    api.get('/admin/applications').then(res => {
      const apps = res.data;
      const newCols = {
        Applied: { name: "Applied", items: [] },
        Shortlisted: { name: "Shortlisted", items: [] },
        Interviewing: { name: "Interviewing", items: [] },
        Offered: { name: "Offered", items: [] }
      };
      
      apps.forEach(app => {
        if(newCols[app.status]) {
          newCols[app.status].items.push(app);
        }
      });
      setColumns(newCols);
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
    
    appliedItems.forEach(app => {
      if (app.studentProfile.cgpa >= 7.5 && app.studentProfile.backlogs === 0) {
        updates.push(api.put(`/admin/applications/${app._id}/status`, { status: 'Shortlisted' }));
      }
    });

    if(updates.length === 0) {
      toast({ title: "No students met criteria." });
      return;
    }

    try {
      await Promise.all(updates);
      toast({ title: `Shortlisted ${updates.length} students automatically!` });
      fetchApplications();
    } catch (err) {
      toast({ title: "Error during auto shortlist", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm text-primary font-bold mb-1">
            <Briefcase className="h-4 w-4" /> Global Applications
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Recruiter ATS Panel</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Manage global placement pipeline</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAutoShortlist} className="gap-2 font-bold shadow-sm border-primary/20 hover:bg-primary/10 hover:text-primary">
            <Filter className="h-4 w-4" /> Auto Shortlist Eligibility (&gt;7.5 CGPA)
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
                                <p className="font-bold text-foreground text-sm">{app.studentProfile.name}</p>
                                {app.drive && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{app.drive.company}</span>}
                            </div>
                            <div className="flex gap-2 mb-3">
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">CGPA: {app.studentProfile.cgpa}</span>
                                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">Backlogs: {app.studentProfile.backlogs}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {app.studentProfile.skills && app.studentProfile.skills.slice(0, 3).map(skill => (
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
