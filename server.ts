import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client lazily to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("Warning: GEMINI_API_KEY is not set or is using the default placeholder.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
    });
  }
  return aiClient;
}

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
}

interface Appointment {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  createdAt: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface FinancialDocument {
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

// In-memory data store for server-session persistence
const users: Record<string, User & { passwordHash: string }> = {
  "business@example.com": {
    id: "user-1",
    name: "Alex Rivers",
    email: "business@example.com",
    company: "Riverside Enterprises",
    role: "Client",
    passwordHash: "password123", // Simple plain storage for demo purposes
  },
  "client@example.com": {
    id: "user-2",
    name: "Jane Doe",
    email: "client@example.com",
    company: "Doe Consulting",
    role: "Client",
    passwordHash: "password123",
  },
};

const appointments: Appointment[] = [
  {
    id: "apt-1",
    userId: "user-1",
    clientName: "Alex Rivers",
    clientEmail: "business@example.com",
    service: "Corporate Tax Planning",
    date: "2026-07-20",
    time: "10:00",
    notes: "Reviewing Q2 financials and planning for the year-end deductions.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-2",
    userId: "user-2",
    clientName: "Jane Doe",
    clientEmail: "client@example.com",
    service: "Bookkeeping Consultation",
    date: "2026-07-22",
    time: "14:00",
    notes: "Monthly accounts reconciliation setup.",
    createdAt: new Date().toISOString(),
  },
];

const contactSubmissions: ContactSubmission[] = [];

// Helper to generate custom, dynamic financial figures based on user
function getUserDocuments(userId: string): FinancialDocument[] {
  // We can vary the figures slightly based on the userId to make it look highly custom
  const multiplier = userId === "user-1" ? 1.5 : 1.0;
  return [
    {
      id: "doc-pl-q2",
      name: "Q2 Profit & Loss Statement",
      type: "P&L Statement",
      period: "Q2 2026",
      status: "Approved",
      revenue: 125000 * multiplier,
      expenses: 78200 * multiplier,
      netMargin: 46800 * multiplier,
      taxOwed: 9820 * multiplier,
    },
    {
      id: "doc-bs-2026",
      name: "Balance Sheet Summary",
      type: "Balance Sheet",
      period: "As of June 2026",
      status: "Finalized",
      revenue: 345000 * multiplier, // Representing total assets
      expenses: 120000 * multiplier, // Representing total liabilities
      netMargin: 225000 * multiplier, // Representing equity
      taxOwed: 0,
    },
    {
      id: "doc-tax-2025",
      name: "FY 2025 Corporate Tax Return",
      type: "Tax Return",
      period: "FY 2025",
      status: "Finalized",
      revenue: 480000 * multiplier,
      expenses: 320000 * multiplier,
      netMargin: 160000 * multiplier,
      taxOwed: 33600 * multiplier,
    },
    {
      id: "doc-inv-1089",
      name: "Invoice #PIN-2026-1089",
      type: "Invoice",
      period: "July 2026",
      status: "Finalized",
      revenue: 2500 * multiplier,
      expenses: 0,
      netMargin: 2500 * multiplier,
      taxOwed: 500 * multiplier,
    },
  ];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Midlleware
  app.use(express.json());

  // API Routes
  
  // Auth endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users[normalizedEmail];

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Return the user (excluding password) and a simulated session token
    const { passwordHash, ...userResponse } = user;
    return res.json({
      user: userResponse,
      token: `simulated-token-${user.id}-${Date.now()}`,
    });
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, company, password } = req.body;
    if (!name || !email || !company || !password) {
      return res.status(400).json({ error: "All registration fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (users[normalizedEmail]) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const newUserId = `user-${Date.now()}`;
    const newUser = {
      id: newUserId,
      name,
      email: normalizedEmail,
      company,
      role: "Client",
      passwordHash: password,
    };

    users[normalizedEmail] = newUser;

    // Auto-create a couple of template appointments/documents
    const { passwordHash, ...userResponse } = newUser;
    return res.json({
      user: userResponse,
      token: `simulated-token-${newUserId}-${Date.now()}`,
    });
  });

  // Retrieve user session
  app.post("/api/auth/me", (req, res) => {
    const { token } = req.body;
    if (!token || !token.startsWith("simulated-token-")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parts = token.split("-");
    const userId = parts[2] + "-" + parts[3]; // Reconstruct user-XXXXX ID
    
    // Find user by id
    const foundUser = Object.values(users).find(u => u.id === userId);
    if (!foundUser) {
      return res.status(401).json({ error: "User not found" });
    }

    const { passwordHash, ...userResponse } = foundUser;
    return res.json({ user: userResponse });
  });

  // Dynamic list of documents
  app.get("/api/documents", (req, res) => {
    const userId = req.query.userId as string || "user-1";
    const docs = getUserDocuments(userId);
    return res.json({ documents: docs });
  });

  // Dynamic PDF-like / CSV downloadable real-time accounting sheets!
  app.get("/api/documents/download/:id", (req, res) => {
    const docId = req.params.id;
    const userId = (req.query.userId as string) || "user-1";
    
    const docs = getUserDocuments(userId);
    const doc = docs.find(d => d.id === docId);

    if (!doc) {
      return res.status(404).send("Document not found");
    }

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${doc.name.replace(/\s+/g, "_")}_${doc.period.replace(/\s+/g, "_")}.csv"`);

    // Let's build custom realistic financial tabular data based on type
    let csvContent = "";
    if (doc.type === "P&L Statement") {
      csvContent = [
        `"Pinnacle Accounting Services - Financial Export"`,
        `"Document:","${doc.name}"`,
        `"Period:","${doc.period}"`,
        `"Status:","${doc.status}"`,
        `"Generated On:","${new Date().toLocaleDateString()}"`,
        `""`,
        `"Category","Description","Amount (USD)"`,
        `"Operating Revenue","Client Consultations & Product Services","${doc.revenue.toFixed(2)}"`,
        `"Gross Revenue","Total Inflow","${doc.revenue.toFixed(2)}"`,
        `""`,
        `"Cost of Operations","Subcontractors & Vendor Fees","-${(doc.expenses * 0.4).toFixed(2)}"`,
        `"General & Administrative","Software Licences & Cloud Compute","-${(doc.expenses * 0.35).toFixed(2)}"`,
        `"Marketing & Sales","Ad campaigns & Business Development","-${(doc.expenses * 0.25).toFixed(2)}"`,
        `"Total Expenses","Operating Expenditures","-${doc.expenses.toFixed(2)}"`,
        `""`,
        `"Net Operating Profit","Gross Revenue less Expenses","${doc.netMargin.toFixed(2)}"`,
        `"Estimated Tax Allocation","State & Federal Tax Provision (${(doc.taxOwed / doc.netMargin * 100).toFixed(1)}%)","-${doc.taxOwed.toFixed(2)}"`,
        `"Net Retained Earnings","Net Profit after Tax Provision","${(doc.netMargin - doc.taxOwed).toFixed(2)}"`
      ].join("\n");
    } else if (doc.type === "Balance Sheet") {
      csvContent = [
        `"Pinnacle Accounting Services - Financial Export"`,
        `"Document:","${doc.name}"`,
        `"As of Date:","${doc.period}"`,
        `"Status:","${doc.status}"`,
        `"Generated On:","${new Date().toLocaleDateString()}"`,
        `""`,
        `"Section","Account Item","Value (USD)"`,
        `"Current Assets","Cash & Cash Equivalents","${(doc.revenue * 0.45).toFixed(2)}"`,
        `"Current Assets","Accounts Receivable","${(doc.revenue * 0.35).toFixed(2)}"`,
        `"Current Assets","Prepaid Expenses","${(doc.revenue * 0.20).toFixed(2)}"`,
        `"Total Current Assets","","${doc.revenue.toFixed(2)}"`,
        `""`,
        `"Current Liabilities","Accounts Payable","${(doc.expenses * 0.4).toFixed(2)}"`,
        `"Current Liabilities","Accrued Liabilities","${(doc.expenses * 0.3).toFixed(2)}"`,
        `"Long-Term Liabilities","Corporate Credit Lines","${(doc.expenses * 0.3).toFixed(2)}"`,
        `"Total Liabilities","","${doc.expenses.toFixed(2)}"`,
        `""`,
        `"Shareholder Equity","Retained Earnings","${(doc.netMargin * 0.6).toFixed(2)}"`,
        `"Shareholder Equity","Common Stock Value","${(doc.netMargin * 0.4).toFixed(2)}"`,
        `"Total Shareholder Equity","Total Book Equity","${doc.netMargin.toFixed(2)}"`,
        `""`,
        `"Reconciliation","Total Liabilities + Equity","${(doc.expenses + doc.netMargin).toFixed(2)}"`,
        `"Status Check","Assets Balance Liabilities & Equity","BALANCED"`
      ].join("\n");
    } else if (doc.type === "Tax Return") {
      csvContent = [
        `"Pinnacle Accounting Services - Tax Return Summary"`,
        `"Tax Entity Period:","${doc.period}"`,
        `"Status:","${doc.status}"`,
        `"Form Filed:","IRS Form 1120 (US Corporation Income Tax)"`,
        `"Generated On:","${new Date().toLocaleDateString()}"`,
        `""`,
        `"Line Item","Description","Amount (USD)"`,
        `"Line 1a","Gross Receipts or Sales","${doc.revenue.toFixed(2)}"`,
        `"Line 2","Cost of Goods Sold (COGS)","-${(doc.expenses * 0.3).toFixed(2)}"`,
        `"Line 3","Gross Profit","${(doc.revenue - doc.expenses * 0.3).toFixed(2)}"`,
        `"Line 12","Compensation of Officers","-${(doc.expenses * 0.25).toFixed(2)}"`,
        `"Line 13","Salaries and Wages","-${(doc.expenses * 0.25).toFixed(2)}"`,
        `"Line 26","Total Deductions Summary","-${(doc.expenses * 0.7).toFixed(2)}"`,
        `"Line 30","Taxable Income before Net Operating Loss","${doc.netMargin.toFixed(2)}"`,
        `"Line 31","Net Operating Loss deduction","0.00"`,
        `"Line 32","Taxable Income","${doc.netMargin.toFixed(2)}"`,
        `"Line 33","Total Tax Owed Liability (21.0% Rate)","${doc.taxOwed.toFixed(2)}"`
      ].join("\n");
    } else {
      // Invoice default
      csvContent = [
        `"Pinnacle Accounting Services - Invoice Summary"`,
        `"Invoice Ref:","${doc.name}"`,
        `"Billing Cycle:","${doc.period}"`,
        `"Payment Status:","Paid/Finalized"`,
        `"Generated On:","${new Date().toLocaleDateString()}"`,
        `""`,
        `"Service Item","Description","Rate (USD)","Hours","Line Total (USD)"`,
        `"Consultation","Strategic tax and structure planning","250.00","4","1000.00"`,
        `"Bookkeeping","Reconciliations and balance sheet preparations","150.00","10","1500.00"`,
        `""`,
        `"Subtotal","","","","2500.00"`,
        `"Tax Surcharge","VAT/Sales Surcharge (20.0%)","","","500.00"`,
        `"Total Amount Due","Thank you for your business!","","","3000.00"`
      ].join("\n");
    }

    return res.send(csvContent);
  });

  // Get Scheduled Appointments for a user
  app.get("/api/appointments", (req, res) => {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId query param is required" });
    }
    const filtered = appointments.filter(a => a.userId === userId);
    return res.json({ appointments: filtered });
  });

  // Book a new appointment
  app.post("/api/appointments", (req, res) => {
    const { userId, clientName, clientEmail, service, date, time, notes } = req.body;
    
    if (!userId || !clientName || !clientEmail || !service || !date || !time) {
      return res.status(400).json({ error: "Missing required booking details." });
    }

    // Standard booking business rule validation: Check if this slot is already booked for this specific date & time!
    const isConflict = appointments.some(
      a => a.date === date && a.time === time
    );

    if (isConflict) {
      return res.status(400).json({
        error: `The time slot ${time} on ${date} is already reserved. Please select another slot.`,
      });
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      userId,
      clientName,
      clientEmail,
      service,
      date,
      time,
      notes,
      createdAt: new Date().toISOString(),
    };

    appointments.push(newApt);
    return res.json({ success: true, appointment: newApt });
  });

  // Submit contact form
  app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const submission: ContactSubmission = {
      id: `contact-${Date.now()}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };

    contactSubmissions.push(submission);
    console.log("Contact form submitted:", submission);

    return res.json({ success: true });
  });

  // Dynamic AI Financial Insights / Advisory via Gemini
  app.post("/api/insights", async (req, res) => {
    const { query, financialData } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        text: `**Pinnacle AI Advisory (Offline Mode):** I have received your question regarding: *"${query}"*.\n\nTo provide fully tailored real-time accounting and tax deduction calculations using live Gemini logic, please make sure your **GEMINI_API_KEY** is configured in your Secrets panel.\n\nBased on general accounting best practices, here are standard suggestions:\n1. Keep receipts for all business purchases above $75.\n2. Ensure you track mileage or maintain logbooks for vehicle-related deductions.\n3. Make quarterly estimated tax payments to avoid underpayment penalties.`
      });
    }

    try {
      const dataSummary = financialData 
        ? `Here is the client's current high-level financial metadata:
           - Company: ${financialData.company || "Demo Company"}
           - Period Revenue: $${financialData.revenue || 0}
           - Period Expenses: $${financialData.expenses || 0}
           - Projected Net Margin: $${financialData.netMargin || 0}
           - Projected Tax Owed: $${financialData.taxOwed || 0}`
        : "No direct financial metadata loaded yet.";

      const prompt = `You are a professional, senior certified public accountant (CPA) and financial planner at Pinnacle Accounting Services.
Your objective is to provide professional, actionable, extremely clean tax and accounting advice based on the user's question.

${dataSummary}

User's Question: "${query}"

Provide your answer in clean Markdown layout. Include lists, bullet points, or numerical tax estimates if applicable. Maintain a confident, highly professional, supportive, and formal CPA tone. Keep your explanation concise and scannable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      return res.status(500).json({ error: "Failed to generate AI financial advice: " + err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
