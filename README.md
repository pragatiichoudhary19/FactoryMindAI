# FactoryMind AI

## The Memory Layer for Industrial Operations

FactoryMind AI is an AI-powered industrial knowledge intelligence platform designed to help organizations track how operational documents evolve over time and detect risks before failures occur.

The system accepts industrial documents such as SOPs, maintenance logs, inspection reports, incident reports, and compliance records, analyzes them using AI-powered document intelligence, and provides:

* Risk Detection
* Change Tracking
* Blast Radius Analysis
* Compliance Impact
* Operational Intelligence

---

## Technology Stack

### Frontend

| Technology   | Purpose                  |
| ------------ | ------------------------ |
| Next.js      | Frontend framework       |
| TypeScript   | Type-safe development    |
| Tailwind CSS | UI styling               |
| React Flow   | Dependency visualization |
| Recharts     | Analytics dashboards     |

---

### Backend

| Technology | Purpose                   |
| ---------- | ------------------------- |
| Python     | Core programming language |
| FastAPI    | API development           |
| SQLite     | Database management       |

---

### AI Layer

| Technology           | Purpose                       |
| -------------------- | ----------------------------- |
| RAG                  | Contextual document retrieval |
| Semantic Search      | Smart document understanding  |
| Risk Engine          | Risk score generation         |
| Temporal Diff Engine | Version comparison            |

---

## Features

### User Module

* Upload industrial documents
* Ask questions using AI Document Copilot
* Compare document versions
* Detect risky changes
* View risk scores
* Analyze compliance impact
* Visualize blast radius

---

### System Module

* Temporal Change Detection
* Risk Assessment Engine
* Dependency Mapping
* Operational Dashboard
* Compliance Tracking

---

## How FactoryMind AI Works

User uploads industrial document
↓
Document Parsing
↓
Chunking & Embeddings
↓
Version Comparison
↓
Risk Analysis
↓
Blast Radius Detection
↓
Dashboard Insights

---

## Demo Scenario

### SOP-12 Compressor Operations

Version 1:

* Inspection interval = 30 days
* Safety checklist included

Version 2:

* Inspection interval = 90 days
* Safety checklist removed

FactoryMind AI detects:

* Critical Risk Score = 92%
* Compliance Violation
* 3 Affected Assets
* 2 Affected Teams

Risk detected before operational failure.

---

## Installation Steps

### Step 1 — Clone Repository

```bash
git clone https://github.com/pragatiichoudhary19/FactoryMindAI.git
cd FactoryMindAI
```

---

### Step 2 — Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

FactoryMindAI/
│── frontend/
│── backend/
│── sample_documents/
│── README.md
│── .gitignore
│── factory_mind.db

---

## Future Scope

* ERP Integration
* IoT Integration
* Predictive Maintenance
* Digital Twin
* Multi-Plant Intelligence

---

## Team

ET AI Hackathon 2.0
Pragati Choudhary
