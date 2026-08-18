import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "./types";
import ServiceCatalog from "./components/ServiceCatalog";
import AppointmentScheduler from "./components/AppointmentScheduler";
import ContactForm from "./components/ContactForm";
import ClientPortal from "./components/ClientPortal";
import { 
  Building2, Calendar, PhoneCall, Shield, 
  Sparkles, CheckCircle2, DollarSign, Users, 
  FileText, Menu, X, ArrowUpRight
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "schedule" | "portal">("home");
  const [user, setUser] = useState<User | null>(null);
  const [preSelectedService, setPreSelectedService] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hydrate session from localStorage on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem("pinnacle_auth_token");
    if (cachedToken) {
      // Fetch session from server to verify token
      fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cachedToken }),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error("Stale token");
          }
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {
          // Clear stale credentials
          localStorage.removeItem("pinnacle_auth_token");
        });
    }
  }, []);

  const handleLogin = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem("pinnacle_auth_token", token);
    setActiveTab("portal"); // Auto-route to portal once authenticated
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("pinnacle_auth_token");
    setActiveTab("home");
  };

  const handleSelectServiceFromCatalog = (serviceTitle: string) => {
    setPreSelectedService(serviceTitle);
    setActiveTab("schedule");
    // Scroll window smoothly to scheduler header
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Editorial Corporate Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Brand */}
          <button 
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 text-slate-900 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          >
            <div className="bg-slate-950 p-2 rounded-xl text-white">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="block font-display font-bold text-lg leading-tight tracking-tight">PINNACLE</span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">Ledger Advisory</span>
            </div>
          </button>

          {/* Desktop Navigation Link Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-xl transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Services & Overview
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-xl transition-all cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Scheduler
            </button>
            <button
              onClick={() => setActiveTab("portal")}
              className={`px-4 py-2 text-xs font-semibold tracking-wide rounded-xl transition-all cursor-pointer ${
                activeTab === "portal"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {user ? "My Client Portal" : "Client Sign-In"}
            </button>
          </nav>

          {/* Call To Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800">{user.name}</span>
                  <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user.company}</span>
                </div>
                <button
                  onClick={() => setActiveTab("portal")}
                  className="bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold tracking-wider px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("portal")}
                className="bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold tracking-wider px-4.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Portal Log In</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
          </div>

          {/* Mobile Hamburguer trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-slate-100 px-6 py-6 space-y-4 absolute top-[73px] left-0 right-0 z-40 shadow-lg"
          >
            <button
              onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2 text-sm font-semibold ${activeTab === "home" ? "text-emerald-600" : "text-slate-600"}`}
            >
              Services & Overview
            </button>
            <button
              onClick={() => { setActiveTab("schedule"); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2 text-sm font-semibold ${activeTab === "schedule" ? "text-emerald-600" : "text-slate-600"}`}
            >
              Scheduler
            </button>
            <button
              onClick={() => { setActiveTab("portal"); setMobileMenuOpen(false); }}
              className={`block w-full text-left py-2 text-sm font-semibold ${activeTab === "portal" ? "text-emerald-600" : "text-slate-600"}`}
            >
              {user ? "My Client Portal" : "Client Sign-In"}
            </button>
            <div className="border-t border-slate-100 pt-4">
              {user ? (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-bold text-slate-800">{user.name}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{user.company}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-600 font-bold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveTab("portal"); setMobileMenuOpen(false); }}
                  className="w-full bg-slate-950 text-white py-3 rounded-xl text-xs font-bold tracking-wider"
                >
                  Secure Log In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area Routing */}
      <main className="grow">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Hero & Interactive Bento Grid Section */}
              <section className="pt-10 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  
                  {/* Hero Card (Col 1-3, Row 1-2) */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-8 md:p-10 flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium tracking-wider text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/40 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span>CPA Advisory • Ledger Optimization • Compliance</span>
                      </span>

                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 leading-tight mb-4 tracking-tight">
                        Financial precision for growing enterprises.
                      </h1>
                      
                      <p className="text-slate-500 text-base font-light leading-relaxed max-w-md">
                        Full-service accounting, strategic tax planning, and real-time financial insights powered by secure cloud technology and credentialed public auditing.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-100">
                      <button
                        onClick={() => setActiveTab("schedule")}
                        className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold tracking-wider px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm uppercase flex items-center justify-center gap-1.5"
                      >
                        <span>Schedule Advisory Consult</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => setActiveTab("portal")}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold tracking-wider px-5 py-3.5 rounded-xl transition-all cursor-pointer uppercase text-center"
                      >
                        Enter Client Portal
                      </button>
                    </div>

                    <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                      <div className="flex -space-x-2">
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-800">JD</div>
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-800">AM</div>
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-800">RO</div>
                        <div className="w-9 h-9 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">+12</div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Expert advisors<br />at your service
                      </p>
                    </div>
                  </div>

                  {/* Right Column Grid (Quick Schedule & Support status) */}
                  <div className="col-span-1 grid grid-cols-1 gap-6">
                    {/* Quick Schedule card */}
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between text-left hover:shadow-md hover:border-slate-300 transition-all cursor-pointer focus:outline-none"
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Schedule Advice</div>
                      <div className="my-3">
                        <div className="text-xl font-bold font-display text-slate-900 leading-tight">Book a certified advisory session</div>
                      </div>
                      <div className="inline-flex items-center text-[10px] text-emerald-700 font-semibold bg-emerald-50 self-start px-2.5 py-1 rounded-md border border-emerald-100/30">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1.5 animate-pulse"></span>
                        Available Today
                      </div>
                    </button>

                    {/* Support Agent card */}
                    <button
                      onClick={() => {
                        const el = document.getElementById("contact");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="bg-slate-100 rounded-3xl p-6 flex flex-col justify-between text-left border border-slate-200 hover:shadow-md hover:bg-slate-50 transition-all cursor-pointer focus:outline-none"
                    >
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Support Agent</div>
                      <div className="flex items-center space-x-3 my-4">
                        <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200/50 shrink-0">
                          SJ
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-none">Sarah Jenkins</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">Senior Consultant</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-mono font-medium">● Online now</div>
                    </button>
                  </div>

                  {/* Row 3: Services Catalog Overview (Col 1-3) */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-wrap items-center justify-around gap-6 shadow-2xs">
                    <button 
                      onClick={() => handleSelectServiceFromCatalog("Corporate Tax Planning & Preparation")}
                      className="text-center group cursor-pointer focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-xl mx-auto mb-2 flex items-center justify-center text-slate-900 font-bold transition-all">$</div>
                      <div className="text-xs font-bold text-slate-900">Tax Prep</div>
                      <div className="text-[10px] text-slate-400">Annual & Quarterly</div>
                    </button>

                    <div className="hidden sm:block h-12 w-px bg-slate-100"></div>

                    <button 
                      onClick={() => handleSelectServiceFromCatalog("Audit Defense & IRS Representation")}
                      className="text-center group cursor-pointer focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-xl mx-auto mb-2 flex items-center justify-center text-slate-900 font-bold transition-all">#</div>
                      <div className="text-xs font-bold text-slate-900">Audit</div>
                      <div className="text-[10px] text-slate-400">Compliance & Risk</div>
                    </button>

                    <div className="hidden sm:block h-12 w-px bg-slate-100"></div>

                    <button 
                      onClick={() => handleSelectServiceFromCatalog("Ongoing Ledger & Bookkeeping Setup")}
                      className="text-center group cursor-pointer focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-xl mx-auto mb-2 flex items-center justify-center text-slate-900 font-bold transition-all">%</div>
                      <div className="text-xs font-bold text-slate-900">Payroll</div>
                      <div className="text-[10px] text-slate-400">Global Processing</div>
                    </button>

                    <div className="hidden sm:block h-12 w-px bg-slate-100"></div>

                    <button 
                      onClick={() => handleSelectServiceFromCatalog("Strategic CFO & Cash Runway Advisory")}
                      className="text-center group cursor-pointer focus:outline-none"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white rounded-xl mx-auto mb-2 flex items-center justify-center text-slate-900 font-bold transition-all">+</div>
                      <div className="text-xs font-bold text-slate-900">Advisory</div>
                      <div className="text-[10px] text-slate-400">M&A / Strategic</div>
                    </button>
                  </div>

                  {/* Row 3: Growth Stat (Col 4) */}
                  <div className="col-span-1 bg-emerald-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-2xs border border-emerald-500/10">
                    <div>
                      <div className="text-3.5xl font-display font-bold">98%</div>
                      <div className="text-[9px] text-emerald-200 uppercase tracking-widest font-mono mt-1 font-semibold">Client Loyalty</div>
                    </div>
                    <div className="text-xs text-emerald-50/90 leading-snug font-medium mt-4">
                      Client retention rate since our founding in 2012.
                    </div>
                  </div>

                </div>
              </section>

              {/* Core Service Catalog component */}
              <ServiceCatalog onSelectService={handleSelectServiceFromCatalog} />

              {/* Integrated Corporate Contact Form component */}
              <ContactForm />
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AppointmentScheduler 
                user={user} 
                preSelectedService={preSelectedService}
                onNavigateToPortal={() => setActiveTab("portal")}
              />
            </motion.div>
          )}

          {activeTab === "portal" && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ClientPortal 
                user={user} 
                onLogin={handleLogin} 
                onLogout={handleLogout} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Minimal, Editorial Footer */}
      <footer className="bg-white border-t border-slate-100 py-10 px-4 md:px-8 mt-12 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg text-white">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-900">PINNACLE</span>
            <span className="text-xs text-slate-400 font-light border-l border-slate-200 pl-2">Licensed & Credentialed CPA Practice</span>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono font-medium justify-center">
            <button onClick={() => setActiveTab("home")} className="hover:text-slate-950 transition-colors">Services</button>
            <button onClick={() => setActiveTab("schedule")} className="hover:text-slate-950 transition-colors">Book Consult</button>
            <button onClick={() => setActiveTab("portal")} className="hover:text-slate-950 transition-colors">Secure Portal</button>
          </div>

          <span className="text-[10px] font-mono text-slate-400 text-center sm:text-right">
            © {new Date().getFullYear()} Pinnacle Advisory LLC. SEC and IRS Compliance Safeguarded.
          </span>
        </div>
      </footer>

    </div>
  );
}
