import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { User, Appointment } from "../types";
import { Calendar, Clock, AlertCircle, CheckCircle, FileText, Plus, UserCheck, Inbox } from "lucide-react";

interface AppointmentSchedulerProps {
  user: User | null;
  preSelectedService?: string;
  onNavigateToPortal: () => void;
}

const AVAILABLE_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export default function AppointmentScheduler({
  user,
  preSelectedService = "",
  onNavigateToPortal,
}: AppointmentSchedulerProps) {
  const [service, setService] = useState(preSelectedService || "Corporate Tax Planning & Preparation");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Status and logs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successApt, setSuccessApt] = useState<Appointment | null>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Update name/email if user logged in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Sync preSelectedService
  useEffect(() => {
    if (preSelectedService) {
      setService(preSelectedService);
    }
  }, [preSelectedService]);

  // Fetch current user's appointments if user exists
  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/appointments?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Format today's date for standard date input minimum parameter
  const getTodayString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessApt(null);

    if (!name || !email || !service || !date || !time) {
      setErrorMsg("Please complete all required fields including date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // If user is not logged in, we simulate a guest user id
      const targetUserId = user?.id || "guest-user";

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetUserId,
          clientName: name,
          clientEmail: email,
          service,
          date,
          time,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || "Failed to book appointment.");
      } else {
        setSuccessApt(data.appointment);
        // Reset form except name/email
        setDate("");
        setTime("");
        setNotes("");
        // Reload list
        fetchAppointments();
      }
    } catch (err: any) {
      setErrorMsg("Network error booking appointment. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full font-medium">
          Automated Scheduling
        </span>
        <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900 mt-4 mb-3">
          Schedule Your Consult Consultation
        </h2>
        <p className="text-slate-600 text-lg font-light leading-relaxed">
          Book a real-time advisory slot instantly. Our scheduler integrates dynamic double-booking checks to ensure secure reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Booking Form Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          <h3 className="text-xl font-display font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span>Select Your Preferred Slot</span>
          </h3>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold">Double-Booking Conflict</p>
                <p className="text-rose-700/95 mt-1">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          {successApt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-lg">Appointment Reserved Successfully!</h4>
                  <p className="text-emerald-800/90 text-sm mt-1">
                    Your session is locked. We have synchronized your details into our corporate ledger calendar.
                  </p>
                  
                  <div className="mt-4 p-4 bg-white/70 backdrop-blur-xs rounded-lg border border-emerald-100/40 text-xs text-slate-800 font-mono space-y-1.5">
                    <div><span className="text-slate-400">SERVICE:</span> {successApt.service}</div>
                    <div><span className="text-slate-400">DATE:</span> {successApt.date}</div>
                    <div><span className="text-slate-400">TIME:</span> {successApt.time} (EST)</div>
                    <div><span className="text-slate-400">RESERVATION REF:</span> {successApt.id}</div>
                  </div>

                  {!user && (
                    <button
                      onClick={onNavigateToPortal}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-900 hover:text-slate-900 underline font-semibold"
                    >
                      <span>Create/Log in to your Client Portal to track files</span>
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleBook} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                Service Required <span className="text-rose-500">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors bg-white"
              >
                <option value="Corporate Tax Planning & Preparation">Corporate Tax Planning & Preparation</option>
                <option value="Full-Cycle Monthly Bookkeeping">Full-Cycle Monthly Bookkeeping</option>
                <option value="Fractional CFO & Advisory Services">Fractional CFO & Advisory Services</option>
                <option value="Audit & Compliance Readiness">Audit & Compliance Readiness</option>
                <option value="High-Net-Worth Wealth & Tax Management">High-Net-Worth Wealth & Tax Management</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select Date <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="date"
                  required
                  min={getTodayString()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time Slot (EST) <span className="text-rose-500">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTime(t)}
                      className={`px-3 py-2 rounded-lg text-xs font-mono tracking-wide border transition-all ${
                        time === t
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {parseInt(t) >= 12 ? `${t} PM` : `${t} AM`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                Notes / Strategic Context <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-950 text-white text-xs font-semibold tracking-wider rounded-xl transition-all hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed uppercase"
            >
              {isSubmitting ? "Syncing Calendar Ledger..." : "Reserve Consultation Slot"}
            </button>
          </form>
        </div>

        {/* Sidebar Info & Dynamic Schedule list if logged in */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security details */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8">
            <h4 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>CPA Calendar Integrity</span>
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-600 font-light leading-relaxed">
              <li className="flex gap-2">
                <span className="text-slate-900 font-semibold">•</span>
                <span>Each reservation secures a dedicated 45-minute technical review with a credentialed Senior CPA.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-900 font-semibold">•</span>
                <span>Active Conflict Verification: The ledger guarantees zero overlapping slots.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-900 font-semibold">•</span>
                <span>To modify an existing booking, please contact your account manager directly or upload request in client portal.</span>
              </li>
            </ul>
          </div>

          {/* Logged in users scheduled list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <h4 className="text-sm font-display font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>My Scheduled Consultations</span>
              {user && (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold">
                  {myAppointments.length} Active
                </span>
              )}
            </h4>

            {!user ? (
              <div className="text-center py-6">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Log in to your Client Portal to see your personal, secure dashboard and real-time scheduling overview.
                </p>
                <button
                  onClick={onNavigateToPortal}
                  className="mt-3 text-xs text-emerald-600 hover:text-slate-900 font-semibold underline"
                >
                  Go to Portal Sign-In
                </button>
              </div>
            ) : myAppointments.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-100 rounded-xl">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-light">No consultations booked yet for this account.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-100 rounded-xl flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="block text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {apt.service}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-1">
                        Ref: {apt.id}
                      </span>
                      {apt.notes && (
                        <p className="text-[10px] text-slate-500 font-light mt-1.5 italic line-clamp-1">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-[11px] font-mono font-medium text-slate-700">
                        {apt.date}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                        {parseInt(apt.time) >= 12 ? `${apt.time} PM` : `${apt.time} AM`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
