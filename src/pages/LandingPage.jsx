import { GraduationCap, Shield, Users, TrendingUp, Award, Moon, Sun, Briefcase, BarChart, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const LandingPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const handleLogin = async (role) => {
        const success = await login(role);
        if(success) navigate(role === "tpo" ? "/dashboard" : role === "recruiter" ? "/recruiter" : "/student");
    };

    const containerVariants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 30 },
      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
    <div className="min-h-screen flex flex-col bg-mesh-gradient overflow-hidden">
      {/* Navbar Navigation */}
      <header className="px-5 py-3 flex items-center justify-between glass-card m-2 mx-4 rounded-2xl sticky top-2 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center glow-primary bg-primary/20 border border-primary/50 text-primary">
            <GraduationCap className="h-6 w-6 md:h-7 md:w-7"/>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">Uni<span className="text-primary">Place</span></h1>
            <p className="hidden md:block text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Placement Portal</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-foreground/80">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full hover:bg-primary/20">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <Button size="sm" onClick={() => handleLogin("student")} className="rounded-full font-bold shadow-sm glow-primary">Login</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* HERO SECTION - Gap reduced uniquely here */}
        <section className="pt-10 pb-20 md:pt-16 md:pb-28 px-6 text-center flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div 
               initial={{ scale: 0.8 }} 
               animate={{ scale: 1 }} 
               transition={{ type: 'spring', damping: 15 }}
               className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs md:text-sm font-bold text-primary mb-2 shadow-sm"
            >
              🚀 Modern Campus Hiring Ecosystem
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.1]">
              Your Gateway to <br/>
              <span className="text-gradient-primary">Elite Tech Placements</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Streamline the entire placement journey. From dazzling student portfolios to recruiter Kanban ATS pipelines and 1-click university accreditation reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 flex-wrap">
              <Button size="lg" onClick={() => handleLogin("student")} className="gap-2 text-lg px-8 py-6 rounded-full glass-card border-primary/50 text-foreground hover:bg-primary/5 shadow-card-hover group">
                <GraduationCap className="h-5 w-5 text-primary group-hover:scale-110 transition-transform"/>
                Student Access
              </Button>
              <Button size="lg" onClick={() => handleLogin("tpo")} className="gap-2 text-lg px-8 py-6 rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-card-hover glow-primary group">
                <Shield className="h-5 w-5 group-hover:scale-110 transition-transform"/>
                Super Admin (TPO)
              </Button>
              <Button size="lg" onClick={() => handleLogin("recruiter")} className="gap-2 text-lg px-8 py-6 rounded-full border-success/50 text-success hover:bg-success/5 shadow-card-hover group bg-background">
                <Briefcase className="h-5 w-5 group-hover:scale-110 transition-transform"/>
                Company Partners
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-4 font-semibold">Join 120+ top tier universities using UniPlace today.</p>
          </motion.div>
        </section>

        {/* TRUSTED BY BANNER */}
        <section className="py-10 border-y border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden flex flex-col items-center">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Trusted by world-class teams</p>
            <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-60">
                {["Microsoft", "Amazon", "Google", "Atlassian", "Meta", "Netflix"].map((brand) => (
                    <span key={brand} className="text-xl md:text-2xl font-extrabold text-foreground tracking-tighter">{brand}</span>
                ))}
            </div>
        </section>

        {/* FEATURES HIGHLIGHT */}
        <section id="features" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                  <h3 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Everything you need to hire and get hired.</h3>
                  <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">We&apos;ve replaced the fragmented spreadsheets with a powerful centralized system engineered for speed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { icon: Shield, title: "Automated Shortlisting", desc: "Recruiters set hard requirements (CGPA &gt; 8.0, 0 Backlogs) and the system instantly filters matching students." },
                      { icon: BarChart, title: "1-Click NIRF Reports", desc: "TPOs can generate massive accreditation CSV exports instantly with accurate, up-to-date placement metrics." },
                      { icon: Briefcase, title: "Kanban ATS", desc: "Drag and drop actual applicants between Applied, Shortlisted, Interviewing, and Offered stages easily." }
                  ].map((feature, i) => (
                      <div key={i} className="glass-card rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                          <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                              <feature.icon className="h-7 w-7 text-primary" />
                          </div>
                          <h4 className="text-xl font-extrabold text-foreground mb-3">{feature.title}</h4>
                          <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
        </section>

        {/* HOW IT WORKS / DUAL JOURNEY */}
        <section id="how-it-works" className="py-24 px-6 bg-primary/5 border-y border-primary/10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <h3 className="text-4xl font-extrabold text-foreground tracking-tight">The Student Journey</h3>
                    <div className="space-y-6">
                        {[
                            { title: "Build Your Profile", desc: "Upload resumes, sync skills, and auto-verify CGPA." },
                            { title: "Discover Drives", desc: "Get instantly notified of eligible companies coming to campus." },
                            { title: "Apply in 1-Click", desc: "No more filling out massive forms. Just click Apply Now." }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="mt-1 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0">
                                    {i+1}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground">{step.title}</h4>
                                    <p className="text-muted-foreground font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border border-primary/20 shadow-card relative overflow-hidden bg-background">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 blur-3xl rounded-full" />
                    <h4 className="text-xl font-bold mb-6 flex items-center gap-2"><Zap className="text-warning h-5 w-5" /> Recent Drive</h4>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-muted-foreground/20 bg-muted/30 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-foreground">Google SWE 2026</p>
                                <p className="text-sm text-success font-medium">Eligible based on profile</p>
                            </div>
                            <Button size="sm" className="glow-primary rounded-full font-bold">Apply Now</Button>
                        </div>
                        <div className="p-4 rounded-xl border border-muted-foreground/20 bg-muted/30 flex justify-between items-center opacity-70 grayscale">
                            <div>
                                <p className="font-bold text-foreground">FinServe Analyst</p>
                                <p className="text-sm text-destructive font-medium">Needs &gt; 8.0 CGPA</p>
                            </div>
                            <Button size="sm" variant="outline" disabled className="rounded-full font-bold">Ineligible</Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24 px-6 w-full">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">Outperforming expectations</h3>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
            { icon: Users, label: "Students Registered", value: "2,400+" },
            { icon: TrendingUp, label: "Placement Rate", value: "87%" },
            { icon: Award, label: "Partner Companies", value: "120+" },
            ].map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="glass-card rounded-3xl p-8 text-center space-y-3 border-primary/10 relative group">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <stat.icon className="h-8 w-8"/>
                </div>
                <p className="text-5xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-lg font-medium text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24 px-6 bg-background">
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center">
                    <h3 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">Loved by Campuses</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card rounded-3xl p-8 border border-primary/10 relative">
                        <div className="flex text-warning mb-4">
                            <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" />
                        </div>
                        <p className="text-lg text-foreground font-medium italic mb-6">&quot;UniPlace replaced our messy Excel sheets. The drag-and-drop recruiter board alone saved my entire team hundreds of hours this placement season.&quot;</p>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">DR</div>
                            <div>
                                <p className="font-extrabold text-foreground">Dr. Rajiv Menon</p>
                                <p className="text-sm text-muted-foreground">Head of TPO, Global Eng College</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-3xl p-8 border border-primary/10 relative">
                        <div className="flex text-warning mb-4">
                            <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" /> <Star className="h-5 w-5 fill-current" />
                        </div>
                        <p className="text-lg text-foreground font-medium italic mb-6">&quot;I loved seeing my profile completion bar fill up! When I hit &apos;Apply&apos; and saw the confetti burst, it actually made job hunting... fun. Got placed at Amazon purely through this portal.&quot;</p>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center font-bold text-success">SP</div>
                            <div>
                                <p className="font-extrabold text-foreground">Sneha Patel</p>
                                <p className="text-sm text-muted-foreground">Placed at Amazon, Batch of &apos;25</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* EXTENDED FOOTER */}
      <footer className="glass-card pt-12 pb-6 px-8 mt-auto rounded-none border-x-0 border-b-0 border-t border-border/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center glow-primary bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5"/>
              </div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">Uni<span className="text-primary">Place</span></h1>
            </div>
            <div className="flex gap-6 text-sm font-semibold text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 text-center text-xs font-semibold text-muted-foreground opacity-70">
            © 2026 UniPlace Technologies. All rights reserved. Built for the modern university ecosystem.
          </div>
      </footer>
    </div>);
};
export default LandingPage;
