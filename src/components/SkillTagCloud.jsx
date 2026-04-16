import { useState } from "react";
import { X } from "lucide-react";
import { ALL_SKILLS } from "@/data/studentProfile";
import { cn } from "@/lib/utils";
export default function SkillTagCloud({ selected, onChange }) {
    const [search, setSearch] = useState("");
    const filtered = ALL_SKILLS.filter((s) => s.toLowerCase().includes(search.toLowerCase()));
    const toggle = (skill) => {
        onChange(selected.includes(skill)
            ? selected.filter((s) => s !== skill)
            : [...selected, skill]);
    };
    return (<div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {selected.map((skill) => (<span key={skill} className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground cursor-pointer hover:bg-primary/80 transition-colors" onClick={() => toggle(skill)}>
            {skill}
            <X className="h-3 w-3"/>
          </span>))}
      </div>
      <input type="text" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
        {filtered.map((skill) => (<button key={skill} type="button" onClick={() => toggle(skill)} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium transition-colors", selected.includes(skill)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground")}>
            {skill}
          </button>))}
      </div>
    </div>);
}
