import { useState, useEffect } from "react";
import { Download, FileBarChart, PieChart as PieChartIcon, TrendingUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import api from "@/lib/api";

export default function ReportsTab() {
  const [isExporting, setIsExporting] = useState(false);
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

  // Simple Analytics Calculation
  const total = students.length;
  const placed = students.filter(s => s.status === "Placed").length;
  const shortlisted = students.filter(s => s.status === "Shortlisted").length;
  const unplaced = total - placed - shortlisted;
  const placementRate = total > 0 ? Math.round((placed / total) * 100) : 0;
  
  // Calculate Avg Package
  const minPackages = [10, 12, 14, 8, 22, 6, 18]; // mocked for demonstration
  const avgPackage = Math.round(minPackages.reduce((a, b) => a + b, 0) / minPackages.length * 10) / 10;
  const highestPackage = Math.max(...minPackages);

  // Chart Data
  const statusData = [
    { name: 'Placed', value: placed },
    { name: 'Shortlisted', value: shortlisted },
    { name: 'Unplaced', value: unplaced },
  ];
  const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const years = [...new Set(students.map(s => s.graduationYear))].sort();
  const yearData = years.map(year => ({
    year: year.toString(),
    Placed: students.filter(s => s.graduationYear === year && s.status === "Placed").length,
    Unplaced: students.filter(s => s.graduationYear === year && s.status !== "Placed").length,
  }));

  const exportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
        const headers = ["ID", "Name", "Department", "Graduation Year", "CGPA", "Placement Status"];
        const rows = students.map(s => [s.id, s.name, s.department || "Engineering", s.graduationYear, s.cgpa, s.status]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "NIRF_Placement_Report_2026.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
    }, 1000);
  };

  if (loading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Accreditation Reports</h1>
          <p className="text-muted-foreground font-medium text-sm mt-1">1-Click generation for NIRF, NAAC, and AICTE compliance.</p>
        </div>
        
        <Button onClick={exportCSV} disabled={isExporting} className="gap-2 font-bold shadow-sm glow-primary hover:scale-105 transition-transform">
          <Download className="h-4 w-4" /> 
          {isExporting ? "Generating CSV..." : "Export NIRF CSV Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-primary/20 shadow-card flex flex-col gap-2 hover:shadow-card-hover transition-all">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                  <p className="text-sm font-bold text-muted-foreground">Placement Rate</p>
                  <p className="text-3xl font-extrabold text-foreground">{placementRate}%</p>
              </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-success/30 bg-success/5 shadow-card flex flex-col gap-2 hover:shadow-card-hover transition-all">
              <div className="h-10 w-10 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                  <p className="text-sm font-bold text-success">Total Placed</p>
                  <p className="text-3xl font-extrabold text-success">{placed}</p>
              </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-destructive/30 bg-destructive/5 shadow-card flex flex-col gap-2 hover:shadow-card-hover transition-all">
              <div className="h-10 w-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                  <p className="text-sm font-bold text-destructive">Still Looking</p>
                  <p className="text-3xl font-extrabold text-destructive">{unplaced}</p>
              </div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-primary/20 shadow-card flex flex-col gap-2 hover:shadow-card-hover transition-all">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileBarChart className="h-5 w-5 text-primary" />
              </div>
              <div>
                  <p className="text-sm font-bold text-muted-foreground">Highest Package</p>
                  <p className="text-3xl font-extrabold text-foreground">{highestPackage} LPA</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="glass-card rounded-2xl p-6 border border-primary/10 shadow-card">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <PieChartIcon className="text-primary h-5 w-5" /> Overall Placement Status
              </h2>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                          >
                              {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                            itemStyle={{ fontWeight: 'bold' }} 
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-primary/10 shadow-card">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <FileBarChart className="text-primary h-5 w-5" /> Year-Over-Year Trends
              </h2>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontWeight: "bold" }} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                          />
                          <Legend iconType="circle" />
                          <Bar dataKey="Placed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                          <Bar dataKey="Unplaced" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>
    </div>
  );
}
