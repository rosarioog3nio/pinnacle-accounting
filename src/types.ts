/**
 * Shared Type Definitions for Pinnacle Accounting Portal
 */

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
}

export interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialDocument {
  id: string;
  name: string;
  type: "Invoice" | "Tax Return" | "Balance Sheet" | "P&L Statement";
  period: string;
  status: "Draft" | "Approved" | "Finalized";
  revenue: number;
  expenses: number;
  netMargin: number;
  taxOwed: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: "tax" | "bookkeeping" | "advisory" | "audit";
  description: string;
  price: string;
  features: string[];
  duration: string;
  popular?: boolean;
}

export const SERVICE_CATALOG: ServiceItem[] = [
  {
    id: "tax-planning",
    title: "Corporate Tax Planning & Preparation",
    category: "tax",
    description: "Proactive, strategic structuring to minimize corporate tax liabilities and secure full compliance with the latest regulations.",
    price: "$750+",
    duration: "Per filing cycle",
    features: [
      "Strategic multi-state tax planning",
      "Annual Federal & State filing preparation",
      "R&D tax credit optimization",
      "Unlimited off-season audit protection advisory"
    ],
    popular: true,
  },
  {
    id: "bookkeeping-basic",
    title: "Full-Cycle Monthly Bookkeeping",
    category: "bookkeeping",
    description: "Continuous accounts tracking, automated bank feed reconciliation, and periodic financial document reporting.",
    price: "$299 / mo",
    duration: "Ongoing monthly",
    features: [
      "Weekly ledger reconciliation",
      "Accounts Payable & Receivable mapping",
      "Monthly Balance Sheets & P&L Statements",
      "Xero / QuickBooks system integration"
    ],
  },
  {
    id: "fractional-cfo",
    title: "Fractional CFO & Advisory Services",
    category: "advisory",
    description: "Forward-looking strategic consulting, custom cash-flow projections, and capital structure advisory to scale your business.",
    price: "$1,499 / mo",
    duration: "Custom monthly contract",
    features: [
      "Bi-weekly strategic review sessions",
      "Scenario planning & runway projections",
      "Board-ready financial presentation decks",
      "Capital fundraising & loan advisory"
    ],
  },
  {
    id: "audit-readiness",
    title: "Audit & Compliance Readiness",
    category: "audit",
    description: "Comprehensive audits of your internal accounting practices and transaction ledgers to ensure absolute clarity and risk reduction.",
    price: "$1,250",
    duration: "One-off audit review",
    features: [
      "Rigorous transaction sample testing",
      "Internal controls framework analysis",
      "Detailed gap & liability reporting",
      "Direct representation support"
    ],
  },
  {
    id: "personal-wealth",
    title: "High-Net-Worth Wealth & Tax Management",
    category: "tax",
    description: "Bespoke personal taxation, trust preparation, and asset transfer structures for business founders and executives.",
    price: "$450+",
    duration: "Annual structure review",
    features: [
      "Founder stock & equity award planning",
      "Trust & estate allocation advisory",
      "Comprehensive global asset compliance",
      "Quarterly estimated tax tracking"
    ],
  },
];
