import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit2, Trash2, Loader2, MapPin, IndianRupee, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

const initialFormState = {
  company: "",
  role: "",
  package: "",
  location: "",
  date: "",
  description: "",
  minCgpa: 0,
  maxBacklogs: 0,
  requiredSkills: "",
  employmentType: "Full-Time",
  status: "Upcoming"
};

export default function ManageDrivesTab() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/admin/drives');
      setDrives(res.data);
    } catch (err) {
      toast({ title: "Failed to load drives", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const openCreateModal = () => {
    setFormData(initialFormState);
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (drive) => {
    setFormData({
      ...drive,
      requiredSkills: drive.requiredSkills.join(", ")
    });
    setEditId(drive._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this drive? All associated student applications will be removed.")) return;
    try {
      await api.delete(`/admin/drives/${id}`);
      setDrives(drives.filter(d => d._id !== id));
      toast({ title: "Drive deleted" });
    } catch (err) {
      toast({ title: "Failed to delete drive", variant: "destructive" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editId) {
        const res = await api.put(`/admin/drives/${editId}`, payload);
        setDrives(drives.map(d => d._id === editId ? res.data : d));
        toast({ title: "Drive updated" });
      } else {
        const res = await api.post('/admin/drives', payload);
        setDrives([res.data, ...drives]);
        toast({ title: "Drive created" });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: "Failed to save drive", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in ease-out duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manage Placement Drives</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">Create, update, and remove upcoming company visits</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 font-bold shadow-sm glow-primary">
          <Plus className="h-4 w-4" /> Create New Drive
        </Button>
      </div>

      <div className="glass-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-bold">Company & Role</th>
                <th className="px-6 py-4 font-bold">Package & Loc</th>
                <th className="px-6 py-4 font-bold">Eligibility</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {drives.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 text-muted-foreground">No drives found. Create one above.</td></tr>
              ) : drives.map((drive) => (
                <tr key={drive._id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground text-base h-auto">{drive.company}</div>
                    <div className="text-primary font-medium flex items-center gap-2">
                        {drive.role}
                        {drive.employmentType === 'Internship' && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">Internship</span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-muted-foreground" /> {drive.package}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {drive.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-muted-foreground"><span className="font-bold text-foreground">CGPA:</span> &ge;{drive.minCgpa}</div>
                    <div className="text-muted-foreground"><span className="font-bold text-foreground">Backlogs:</span> &le;{drive.maxBacklogs}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={drive.status === "Upcoming" ? "warning" : drive.status === "Ongoing" ? "success" : "secondary"}>
                      {drive.status === "Upcoming" ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                      {drive.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(drive)} className="h-8 w-8 hover:text-primary hover:bg-primary/10">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(drive._id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary/20">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-border/50 pb-4">
                <h2 className="text-xl font-bold text-foreground">{editId ? "Edit Placement Drive" : "Create Placement Drive"}</h2>
                <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={() => setIsModalOpen(false)}>
                  <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Company Name</Label><Input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Role / Designation</Label><Input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Package (CTC)</Label><Input value={formData.package} onChange={e => setFormData({ ...formData, package: e.target.value })} placeholder="e.g. 15 LPA" required /></div>
                <div className="space-y-1.5"><Label>Location</Label><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Minimum CGPA</Label><Input type="number" step="0.1" value={formData.minCgpa} onChange={e => setFormData({ ...formData, minCgpa: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Max Allowed Backlogs</Label><Input type="number" value={formData.maxBacklogs} onChange={e => setFormData({ ...formData, maxBacklogs: e.target.value })} required /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Required Skills (comma separated)</Label><Input value={formData.requiredSkills} onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })} placeholder="React, Node, Python..." /></div>
                <div className="space-y-1.5 md:col-span-2"><Label>Description</Label><Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief details about the company and role" /></div>
                
                <div className="space-y-1.5">
                  <Label>Employment Type</Label>
                  <select value={formData.employmentType} onChange={e => setFormData({ ...formData, employmentType: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="glow-primary">{editId ? "Update Drive" : "Create Drive"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
