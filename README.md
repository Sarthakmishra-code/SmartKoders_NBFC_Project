# SmartKoder – Agentic AI for Smarter Lending

SmartKoder is an **agentic AI–powered lending assistant** designed to help NBFCs modernize and automate digital loan journeys.  
It combines a real-time conversational chatbot, Python ML services, and a Node.js orchestration layer to automate **document verification**, **loan eligibility scoring**, and **decisioning**.

---

## 🚀 Key Features

- **Agentic AI Architecture**
  - Master Agent orchestrating specialized Worker Agents (Verification, Underwriting, Decision).
  - Clear separation of concerns between conversation, validation, and decisioning.

- **End-to-End Loan Journey**
  - Conversational intake (chat) for borrower details and document upload.
  - Document OCR + classification (PAN, salary slip) and structured key-value extraction.
  - Feature extraction → ML inference → Approval decision + EMI & risk insights.

- **Hybrid Tech Stack**
  - Frontend: React + Vite + Tailwind CSS + Socket.IO (real-time chat).
  - Backend: Node.js + Express + Socket.IO (Master Agent & APIs).
  - ML Service: Python + FastAPI (XGBoost models, OCR using pytesseract).

- **Admin (MVP)**
  - Lightweight dashboard for viewing applications, decisions, and processing metrics.

---

## 🏗 Architecture Overview

React Frontend (Chat + Dashboard)
│
│ WebSocket + REST
▼
Node.js Backend (Master Agent + APIs)
│
│ HTTP (JSON + files)
▼
Python ML Microservice (FastAPI)
├─ Loan Eligibility Model (XGBoost)
├─ Credit Risk Model (XGBoost)
└─ OCR + Document Classification (pytesseract, OpenCV, Pillow)

yaml
Copy code

---

## 📁 Project Structure

smartkoder-mvp/
├── backend/
│ ├── src/
│ │ ├── agents/ # Master + Worker agents (orchestration)
│ │ ├── controllers/ # REST controllers (app logic)
│ │ ├── routes/ # Express route definitions
│ │ ├── services/ # ML service client, file handling, business services
│ │ ├── models/ # Sequelize models (SQLite)
│ │ ├── middleware/ # Authentication, validation, error handling
│ │ ├── utils/ # Shared helpers
│ │ └── server.js # Backend entrypoint
│ ├── uploads/ # Temporary uploaded files (Multer)
│ ├── data/ # SQLite DB file(s)
│ ├── package.json
│ └── .env.example
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Chat UI, Upload, LoanSummary, AdminDashboard
│ │ ├── pages/
│ │ ├── services/ # API + Socket clients
│ │ ├── hooks/
│ │ └── App.jsx
│ ├── package.json
│ └── .env.example
│
├── ml-service/
│ ├── main.py # FastAPI app (OCR + ML endpoints)
│ ├── train_models.py # Training pipeline for XGBoost models
│ ├── models/ # Saved model files (.pkl)
│ ├── utils/ # OCR helpers, feature builders
│ └── requirements.txt
│
└── docs/ # Architecture and API docs (optional)

markdown
Copy code

---

## 🧰 Tech Stack (Technicalities)

- **Frontend**
  - React (functional components + hooks)
  - Vite (bundler)
  - Tailwind CSS (utility CSS)
  - Socket.IO client for real-time chat messages

- **Backend**
  - Node.js + Express
  - Socket.IO server (real-time)
  - Sequelize ORM + SQLite (local dev)
  - Multer (multipart/file uploads)
  - Axios (HTTP client to ML service)
  - dotenv for config

- **ML / AI**
  - Python 3.10+
  - FastAPI (REST endpoints)
  - XGBoost + scikit-learn (models exported with joblib/pickle)
  - pytesseract, Pillow, OpenCV (OCR & preproc)
  - pandas / numpy for feature processing

---

## ⚙️ Prerequisites

- Node.js (LTS)
- Python 3.10+
- npm or yarn
- pip (or pipenv / poetry)
- Tesseract OCR installed on host (for pytesseract)

---

## 🔧 Setup & Run (Local)

> Clone the repository and run services locally. Example assumes `bash` on macOS/Linux; Windows users will need to adapt activation commands.

### 1) Clone

```bash
git clone https://github.com/<your-username>/smartkoder-mvp.git
cd smartkoder-mvp
2) Start Python ML Service (FastAPI)
bash
Copy code
cd ml-service

# create & activate venv
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# install deps
pip install -r requirements.txt

# (optional) train models to produce models/*.pkl
python train_models.py

# run FastAPI ML service
uvicorn main:app --reload --port 8000
Important ML endpoints (examples):

POST /ocr/classify — classify uploaded image (PAN / salary slip) and return extracted fields

POST /ml/eligibility — accept feature JSON, return approval, score, confidence

POST /ml/risk — return risk score / explainability payload

3) Start Node.js Backend (Master Agent + APIs)
bash
Copy code
cd ../backend
cp .env.example .env            # set ML_SERVICE_URL=http://localhost:8000, PORT=3001, DB path, etc.
npm install
npm run dev                     # or `node src/server.js` for production
Key backend responsibilities

Socket.IO namespaces/rooms for chat sessions

Master Agent orchestrates: receive chat events → spawn Worker Agents

Worker Agents:

Verification Agent: handle file upload → forward to ML OCR

Underwriting Agent: build features → call ML eligibility

Decision Agent: combine signals → compute EMI, approval, persist result

Persistence: store applications, documents references, decisions in SQLite via Sequelize

4) Start Frontend
bash
Copy code
cd ../frontend
cp .env.example .env            # set VITE_BACKEND_URL=http://localhost:3001
npm install
npm run dev                     # starts Vite dev server (default 5173)
Open: http://localhost:5173 — start a chat and submit an application.

💬 Demo Flow (MVP, technical sequence)
Frontend chat collects borrower info (name, monthly income, existing EMIs, requested amount/tenure).

User uploads document images (PAN / salary slip) via chat upload component.

Backend receives upload via Multer → saves to uploads/ and streams file to ML service:

POST http://ml-service:8000/ocr/classify with multipart file

ML service returns structured fields (e.g., PAN number, name match, salary components).

Backend constructs feature vector:

income, existing_emi, tenure, document_verified_flag, extracted_salary, derived_ratio_features...

Backend calls POST http://ml-service:8000/ml/eligibility with JSON features.

ML responds with { approved: true/false, max_amount, confidence, risk_score }.

Decision Agent computes EMI schedule (standard amortization) and persists application outcome in SQLite.

Frontend receives socket event with result → renders Loan Summary card and notifies admin via dashboard socket feed.

🔎 Implementation Notes & Code Snippets
Example: EMI calculation (Node.js snippet)
js
Copy code
// utils/finance.js
function calcEMI(principal, annualRatePct, tenureMonths) {
  const r = (annualRatePct / 100) / 12;
  if (r === 0) return principal / tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Number(emi.toFixed(2));
}

module.exports = { calcEMI };
Example: Backend ML client (Axios)
js
Copy code
// services/mlClient.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function sendFileToOCR(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  const res = await axios.post(`${ML_URL}/ocr/classify`, form, {
    headers: form.getHeaders(),
    timeout: 30000,
  });
  return res.data;
}

async function predictEligibility(features) {
  const res = await axios.post(`${ML_URL}/ml/eligibility`, features);
  return res.data;
}

module.exports = { sendFileToOCR, predictEligibility };
Example: FastAPI OCR endpoint (Python)
py
Copy code
# main.py (ml-service)
from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
import uvicorn
import pytesseract
from PIL import Image
import io

app = FastAPI()

@app.post("/ocr/classify")
async def ocr_classify(file: UploadFile = File(...)):
    data = await file.read()
    img = Image.open(io.BytesIO(data)).convert("RGB")
    text = pytesseract.image_to_string(img)
    # basic heuristic: detect PAN vs salary slip
    if "INCOME TAX DEPARTMENT" in text.upper() or "INCOME" in text.upper():
        doc_type = "salary_slip"
    elif len([w for w in text.split() if len(w) == 10]) > 0:
        doc_type = "pan"
    else:
        doc_type = "unknown"
    # dummy extraction (implement regexes/parsing as needed)
    extracted = {"raw_text": text, "doc_type": doc_type}
    return {"success": True, "extracted": extracted}
📊 Possible Extensions (engineering roadmap)
Integrate with credit bureau APIs (CIBIL / Experian / Equifax) for richer scoring.

Add XAI: SHAP explainability for model predictions, surfaced to underwriting.

Expand product types (personal, auto, business) and product-specific feature pipelines.

Harden security: JWT auth, RBAC for admin, secure file storage (S3), encryption at rest.

Move from SQLite → Postgres for production, add migrations and connection pooling.

Add integration tests, CI/CD pipelines, containerization (Docker) for each service.

⚠️ Technical Note
This repository is an educational/hackathon-level MVP and not production-ready. Before using for any live lending decisions: conduct regulatory reviews, security hardening, model validation, fairness/bias audits, logging/tracing, and operational readiness checks.
