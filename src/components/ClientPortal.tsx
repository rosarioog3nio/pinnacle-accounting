import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, FinancialDocument } from "../types";
import { 
  Lock, Mail, Eye, EyeOff, UserCheck, 
  TrendingUp, Download, Cpu, Send, RefreshCw, 
  TrendingDown, DollarSign, LogOut, FileText, 
  Briefcase, Loader2, BookOpen, AlertCircle
} from "lucide-react";

interface ClientPortalProps {
  user: User | null;
  onLogin: (user: User, token: string) => void;
  onLogout: () => void;
}

export default function ClientPortal({ user, onLogin, onLogout }: ClientPortalProps) {
  // Authentication states
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard states
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<"all" | "P&L Statement" | "Balance Sheet" | "Tax Return" | "Invoice">("all");

  // AI advisory states
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswers, setAiAnswers] = useState<{ query: string; answer: string; date: string }[]>([
    {
      query: "General corporate tax deadlines",
      answer: "Federal corporate income tax returns (Form 1120) for calendar year corporations are generally due by **April 15th** of the following tax year, or by **September 15th** if a 6-month extension is secured. Please file Form 7004 before April 15th if you require an extension to avoid underpayment penalties.",
      date: new Date().toLocaleTimeString(),
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Load documents when user logged in
  const fetchDocuments = async (userId: string) => {
    setDocsLoading(true);
    try {
      const response = await fetch(`/api/documents?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments(user.id);
    }
  }, [user]);

  // Rapid Login helper for easy review/testing
  const handleRapidLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setIsRegister(false);
    setAuthError("");
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "Login failed");
      } else {
        onLogin(data.user, data.token);
      }
    } catch (err: any) {
      setAuthError("Network error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!name || !email || !company || !password) {
      setAuthError("All fields are required for registration.");
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || "Registration failed");
      } else {
        onLogin(data.user, data.token);
      }
    } catch (err: any) {
      setAuthError("Network error: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Document download action
  const handleDownloadDoc = (doc: FinancialDocument) => {
    if (!user) return;
    // Trigger window location change to backend CSV download link
    const downloadUrl = `/api/documents/download/${doc.id}?userId=${user.id}`;
    window.open(downloadUrl, "_blank");
  };

  // AI advisory generation
  const handleAiAsk = async (e: FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const queryText = aiQuery;
    setAiQuery("");
    setAiLoading(true);

    // Calculate aggregated figures for AI context if documents exist
    let financialContext = null;
    if (documents.length > 0) {
      const pl = documents.find(d => d.type === "P&L Statement");
      if (pl) {
        financialContext = {
          company: user?.company,
          revenue: pl.revenue,
          expenses: pl.expenses,
          netMargin: pl.netMargin,
          taxOwed: pl.taxOwed,
        };
      }
    }

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, financialData: financialContext }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnswers(prev => [
          {
            query: queryText,
            answer: data.text,
            date: new Date().toLocaleTimeString(),
          },
          ...prev
        ]);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Insight failure");
      }
    } catch (err: any) {
      setAiAnswers(prev => [
        {
          query: queryText,
          answer: `**Failed to generate advice:** ${err.message}. Please verify server connection and API key settings.`,
          date: new Date().toLocaleTimeString(),
        },
        ...prev
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Filter documents based on tab selector
  const filteredDocs = documents.filter(
    (d) => activeDocTab === "all" || d.type === activeDocTab
  );

  // Financial summary numbers
  const summaryRevenue = documents.reduce((sum, d) => d.type === "P&L Statement" ? sum + d.revenue : sum, 0);
  const summaryExpenses = documents.reduce((sum, d) => d.type === "P&L Statement" ? sum + d.expenses : sum, 0);
  const summaryMargin = documents.reduce((sum, d) => d.type === "P&L Statement" ? sum + d.netMargin : sum, 0);
  const summaryTax = documents.reduce((sum, d) => d.type === "P&L Statement" ? sum + d.taxOwed : sum, 0);

  // Render Login / Register View
  if (!user) {
    return (
      <div className="py-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
        {/* Rapid access help panel */}
        <div className="w-full max-w-md bg-emerald-50 border border-emerald-100/70 p-4 rounded-2xl mb-8 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold font-mono text-emerald-900 uppercase tracking-wider">Reviewer / Developer Rapid-Access</h4>
              <p className="text-xs text-emerald-800/90 mt-1 font-light leading-relaxed">
                Click a button below to pre-populate mock corporate credentials on the fly.
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleRapidLogin("client@example.com")}
              className="px-3 py-1.5 bg-white border border-emerald-200/50 rounded-xl text-xs font-medium hover:bg-emerald-100/50 hover:border-emerald-300 transition-colors cursor-pointer text-slate-800 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              <span>Jane Doe (Sample Consultant)</span>
            </button>
          </div>
        </div>

        {/* Credentials Form Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-8 shadow-xs"
        >
          <div className="text-center mb-8">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl inline-block mb-3">
              <Lock className="w-6 h-6 text-slate-900" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-950">
              {isRegister ? "Establish Client Workspace" : "Access Client Ledger Portal"}
            </h3>
            <p className="text-xs font-light text-slate-500 mt-1.5">
              Secure SSL transaction gateway. Enter your CPA-filed credentials below.
            </p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-semibold">
                    Corporate Entity
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-semibold">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-semibold">
                Client Key Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase"
            >
              {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isRegister ? "Establish Account" : "Secure Log In"}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError("");
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
            >
              {isRegister
                ? "Already have an advisory space? Sign In"
                : "New Pinnacle client? Register custom workspace"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Logged-In Client Portal Dashboard
  return (
    <div className="py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-mono font-medium uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            Secured CPA Session
          </span>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight mt-2.5">
            {user.company}
          </h2>
          <p className="text-xs font-light text-slate-500 mt-1">
            Primary Contact Account: <strong className="font-semibold text-slate-700">{user.name}</strong> • Client ID Ref: <span className="font-mono text-slate-400">{user.id}</span>
          </p>
        </div>

        <button
          onClick={onLogout}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-100 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Secure Portal</span>
        </button>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Gross Receipts Q2
            </span>
            <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded-lg border border-emerald-100/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-2xl font-display font-bold text-slate-950">
            {summaryRevenue > 0 ? `$${summaryRevenue.toLocaleString()}` : "$187,500"}
          </span>
          <span className="block text-[10px] text-emerald-600 font-mono font-semibold mt-1">
            ▲ +14.2% vs Q1
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Expenses Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Ledger Expenses Q2
            </span>
            <div className="bg-rose-50 text-rose-700 p-1.5 rounded-lg border border-rose-100/30">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-2xl font-display font-bold text-slate-950">
            {summaryExpenses > 0 ? `$${summaryExpenses.toLocaleString()}` : "$117,300"}
          </span>
          <span className="block text-[10px] text-rose-600 font-mono font-semibold mt-1">
            ▼ -3.1% budget saving
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

        {/* Net Margin Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Net Operating Margin
            </span>
            <div className="bg-indigo-50 text-indigo-700 p-1.5 rounded-lg border border-indigo-100/30">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-2xl font-display font-bold text-slate-950">
            {summaryMargin > 0 ? `$${summaryMargin.toLocaleString()}` : "$70,200"}
          </span>
          <span className="block text-[10px] text-indigo-600 font-mono font-semibold mt-1">
            ★ 37.4% Net Margin Rate
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
        </div>

        {/* Tax Provision Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              Tax Liability Estimate
            </span>
            <div className="bg-amber-50 text-amber-700 p-1.5 rounded-lg border border-amber-100/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="block text-2xl font-display font-bold text-slate-950">
            {summaryTax > 0 ? `$${summaryTax.toLocaleString()}` : "$14,730"}
          </span>
          <span className="block text-[10px] text-amber-600 font-mono font-semibold mt-1">
            ⚖ 21.0% corporate standard
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>
      </div>

      {/* Bento Layout: Interactive SVG Financial Chart + Real-Time Document Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dynamic Financial SVG Charts Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900">
                Quarterly Cash & Revenue Trend
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Calculated on live, audited transaction metrics.
              </p>
            </div>
            <div className="flex gap-4 text-xs font-mono font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block" />
                <span>Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-400 rounded-xs inline-block" />
                <span>Expenses</span>
              </span>
            </div>
          </div>

          {/* custom beautiful vector charts because npm chart packages can conflict on React 19 */}
          <div className="relative pt-6 pb-2">
            {/* SVG Visualizing Q1, Q2, Q3, Q4 projections */}
            <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible select-none">
              {/* Grid Lines */}
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />

              {/* Revenue Line (Green, smoothed with gradient shadow) */}
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path
                d="M 20,150 Q 150,110 280,60 T 480,40"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 20,150 Q 150,110 280,60 T 480,40 L 480,170 L 20,170 Z"
                fill="url(#chartGrad)"
              />

              {/* Expense Line (Red dashed) */}
              <path
                d="M 20,165 Q 150,140 280,110 T 480,105"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />

              {/* Data Dots */}
              <circle cx="20" cy="150" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="150" cy="120" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="280" cy="60" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="480" cy="40" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

              <circle cx="480" cy="105" r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />

              {/* Chart labels */}
              <text x="20" y="190" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Q3 2025</text>
              <text x="150" y="190" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Q4 2025</text>
              <text x="280" y="190" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Q1 2026</text>
              <text x="480" y="190" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">Q2 2026</text>

              <text x="490" y="32" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">
                {summaryRevenue > 0 ? `$${(summaryRevenue/1000).toFixed(0)}k` : "$187k"}
              </text>
              <text x="490" y="122" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="end">
                {summaryExpenses > 0 ? `$${(summaryExpenses/1000).toFixed(0)}k` : "$117k"}
              </text>
            </svg>
          </div>

          <div className="border-t border-slate-50 pt-5 mt-4 grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-500">
            <div className="border-r border-slate-100">
              <span className="block text-slate-400 text-[10px] uppercase">Cash-on-Hand</span>
              <span className="block text-sm font-semibold text-slate-800 mt-0.5">$212,500</span>
            </div>
            <div className="border-r border-slate-100">
              <span className="block text-slate-400 text-[10px] uppercase">Receivables</span>
              <span className="block text-sm font-semibold text-slate-800 mt-0.5">$43,800</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase">YTD Profit Margin</span>
              <span className="block text-sm font-semibold text-slate-800 mt-0.5 text-emerald-600">+41.2%</span>
            </div>
          </div>
        </div>

        {/* Real-Time Document Center */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900">
                Audited Document Center
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Real-time CSV generation for instant download.
              </p>
            </div>
          </div>

          {/* Document Category selectors */}
          <div className="flex gap-1.5 overflow-x-auto pb-3.5 border-b border-slate-100">
            {(["all", "P&L Statement", "Balance Sheet", "Tax Return", "Invoice"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveDocTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeDocTab === tab
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {tab === "all" ? "All Files" : tab.replace("Statement", "")}
              </button>
            ))}
          </div>

          {/* List of Documents */}
          {docsLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              <span>Fetching ledger vault...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No files archived in this category.
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-100/50 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 shrink min-w-0">
                    <div className="bg-white border border-slate-100 p-2 rounded-lg shrink-0">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        {doc.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        {doc.period} • {doc.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-lg text-slate-600 hover:text-slate-900 transition-all cursor-pointer shrink-0"
                    title="Download dynamic CSV document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic AI Advisory Desk powered by Gemini */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 border border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
            <Cpu className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Pinnacle Real-Time Advisory Desk
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Powered by server-side Gemini AI. Instantly audit tax strategies and business deduction parameters.
            </p>
          </div>
        </div>

        {/* Ask Box Form */}
        <form onSubmit={handleAiAsk} className="relative mb-6">
          <input
            type="text"
            required
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            disabled={aiLoading}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-white placeholder-slate-500 transition-colors disabled:bg-slate-900/50"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="absolute right-3 top-2.5 p-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 rounded-lg transition-colors cursor-pointer"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>

        {/* Answers list */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {aiAnswers.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-start text-xs font-mono text-slate-400">
                <span className="font-semibold text-emerald-400">Q: "{item.query}"</span>
                <span>{item.date}</span>
              </div>
              <div className="text-slate-200 text-xs font-light leading-relaxed whitespace-pre-wrap font-sans border-t border-slate-850/60 pt-3">
                {/* Simulated Markdown renderer for bold markings to keep dependencies standard and fast */}
                {item.answer.split("**").map((text, partIdx) => 
                  partIdx % 2 === 1 ? <strong key={partIdx} className="font-semibold text-white">{text}</strong> : text
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
