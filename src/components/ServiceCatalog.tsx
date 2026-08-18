import { useState } from "react";
import { motion } from "motion/react";
import { SERVICE_CATALOG, ServiceItem } from "../types";
import { ShieldCheck, Check, ChevronRight, TrendingUp, Cpu, Award } from "lucide-react";

interface ServiceCatalogProps {
  onSelectService: (serviceTitle: string) => void;
}

export default function ServiceCatalog({ onSelectService }: ServiceCatalogProps) {
  const [activeTab, setActiveTab] = useState<"all" | "tax" | "bookkeeping" | "advisory" | "audit">("all");

  const filteredServices = SERVICE_CATALOG.filter(
    (s) => activeTab === "all" || s.category === activeTab
  );

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto" id="services">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full font-medium">
          Our Capabilities
        </span>
        <h2 className="text-4xl font-display font-bold tracking-tight text-slate-900 mt-4 mb-3">
          Smarter Accounting for Modern Enterprises
        </h2>
        <p className="text-slate-600 text-lg font-light leading-relaxed">
          From high-growth startups seeking strategic CFO advisory to corporations securing complex tax preparation, our bespoke services are tailored for seamless compliance and execution.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-slate-100 pb-6">
        {(["all", "tax", "bookkeeping", "advisory", "audit"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`relative flex flex-col justify-between bg-white border rounded-3xl p-8 transition-shadow duration-300 hover:shadow-md ${
              service.popular ? "border-slate-900 shadow-sm" : "border-slate-200"
            }`}
          >
            {service.popular && (
              <span className="absolute -top-3 left-8 bg-slate-900 text-white text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                Most Popular
              </span>
            )}

            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/40">
                  {service.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {service.duration}
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-slate-950 mb-3 tracking-tight">
                {service.title}
              </h3>
              <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">
                {service.description}
              </p>

              {/* Price Tag */}
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-slate-900">
                  {service.price}
                </span>
              </div>

              {/* Features List */}
              <div className="border-t border-slate-100 pt-6 mb-8">
                <h4 className="text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider mb-3">
                  Included in package:
                </h4>
                <ul className="space-y-2.5">
                  {service.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="font-light leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSelectService(service.title)}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                service.popular
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>Schedule Initial Advisory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="mt-16 bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-lg font-display font-bold text-slate-900">
              CPA-Certified & Insured Advisory Firm
            </h4>
            <p className="text-sm text-slate-600 font-light mt-1 max-w-xl">
              Our firm maintains standard general and professional liability insurance safeguards. Your financial records are handled strictly by credentialed CPAs in alignment with SOC-2 parameters.
            </p>
          </div>
        </div>
        <div className="flex gap-6 border-t border-slate-200/60 md:border-t-0 pt-6 md:pt-0 w-full md:w-auto justify-around">
          <div className="text-center">
            <span className="block text-2xl font-display font-bold text-slate-900">99.8%</span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Audit Protection</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-display font-bold text-slate-900">10+ Years</span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Average Retention</span>
          </div>
        </div>
      </div>
    </section>
  );
}
