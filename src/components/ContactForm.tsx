import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, Send, Globe } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Tax & Accounting Advisory");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid, corporate email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (response.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Failed to submit query.");
      }
    } catch (err: any) {
      setErrorMsg("Network error submitting contact request. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto" id="contact">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full font-medium">
          Get In Touch
        </span>
        <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900 mt-4 mb-3">
          Contact Our Corporate Office
        </h2>
        <p className="text-slate-600 text-lg font-light leading-relaxed">
          Submit a secure client consultation brief below. Your transmission is processed strictly in compliance with professional standard practices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        {/* Contact Form Details */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold text-slate-950 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>Submit Secure Advisory Brief</span>
            </h3>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-900 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-display font-bold text-sm">Brief Transmitted Successfully</p>
                  <p className="text-emerald-800/95 text-xs mt-1 leading-relaxed">
                    We have securely cataloged your business profile. A certified general public accountant will audit your requirements and follow up within 2 business hours.
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                    My Name <span className="text-rose-500">*</span>
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
                    My Corporate Email <span className="text-rose-500">*</span>
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
                  Primary Advisory Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors bg-white"
                >
                  <option value="Tax & Accounting Advisory">Tax & Accounting Advisory</option>
                  <option value="Ongoing Bookkeeping Setup">Ongoing Bookkeeping Setup</option>
                  <option value="Strategic CFO & Runway Consulting">Strategic CFO & Runway Consulting</option>
                  <option value="Compliance, Audits & SOC-2 Audit Support">Compliance, Audits & SOC-2 Audit Support</option>
                  <option value="General Business Inquiry">General Business Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                  Brief Inquiry Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-light text-slate-900 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-950 text-white text-xs font-semibold tracking-wider rounded-xl transition-all hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed uppercase"
              >
                {isSubmitting ? "Transmitting Brief..." : "Submit Secure Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Corporate Directory Details */}
        <div className="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between border border-slate-800">
          <div>
            <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span>Office Headquarters</span>
            </h3>
            
            <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
              Pinnacle maintains central physical headquarters in Manhattan's financial district, offering hybrid corporate auditing services globally.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Physical Office</h4>
                  <p className="text-sm font-light mt-1">
                    75 Wall Street, Floor 32<br />
                    New York, NY 10005
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shrink-0">
                  <Mail className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Email Communications</h4>
                  <p className="text-sm font-light mt-1">
                    advisory@pinnacle-accounting.com<br />
                    portal-support@pinnacle-accounting.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shrink-0">
                  <Phone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Telephone Desk</h4>
                  <p className="text-sm font-light mt-1">
                    +1 (212) 555-0190
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shrink-0">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Operating Hours</h4>
                  <p className="text-sm font-light mt-1">
                    Monday – Friday: 8:00 AM – 6:00 PM EST<br />
                    Saturday: 10:00 AM – 2:00 PM EST (Tax Season Only)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-900/60 flex items-center justify-between text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Pinnacle LLC</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CPA Ledger Online</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
