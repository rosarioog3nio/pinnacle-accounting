# Pinnacle Accounting

A comprehensive professional accounting services platform designed for modern financial firms. Pinnacle Accounting streamlines client relationships, service delivery, and financial management through an intuitive web application.

## Features

- **Secure Client Portal**: Clients can register, log in, and access their financial documents and account information in a secure, encrypted environment
- **Service Catalog**: Display comprehensive accounting and financial services offerings with detailed descriptions and pricing
- **Automated Appointment Scheduling**: Streamlined booking system allowing clients to schedule consultations with your accounting professionals
- **Real-Time Document Management**: Secure upload and download of financial documents with role-based access controls
- **Financial Advisory Integration**: AI-powered financial query system to provide instant answers to common accounting questions
- **Professional Dashboard**: Intuitive interface for managing client relationships, appointments, and service delivery

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Gemini API Key (for financial advisory features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   APP_URL=http://localhost:5173
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **UI Components**: Lucide React Icons
- **AI Integration**: Google Gemini API
- **Styling**: Tailwind CSS with custom animations
