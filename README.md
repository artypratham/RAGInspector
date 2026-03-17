# RAG Inspector

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vite.dev/)

**A Diagnostic Framework for Evaluating RAG + LLM Pipelines**

RAG Inspector is a full-stack web application that provides field-level human annotation, persistent storage, and comprehensive reporting for evaluating Retrieval-Augmented Generation (RAG) systems. Unlike traditional metrics, it separates **faithfulness**, **retrieval relevance**, and **end-to-end correctness** to enable targeted improvements.

---

## 🎯 What RAG Inspector Does

Most RAG evaluations only answer: *"Is the output correct?"*

RAG Inspector answers the **actionable questions**:

- ❓ **Was the retrieved context relevant?**
- ❓ **Was the LLM faithful to that context?**
- ❓ **Is the failure caused by retrieval, generation, or both?**
- ❓ **Which fields, documents, or schemas fail most often?**

Built for:
- RAG system builders
- LLM platform engineers
- Document intelligence teams
- FinTech / Legal / Enterprise AI use cases

---

## ✨ Key Features

### 📝 Human-in-the-Loop Annotation Workflow
1. Upload schema + RAG output JSON
2. Annotate each extracted field as **Correct** or **Incorrect**
3. For incorrect fields, specify:
   - Expected value
   - Error category (hallucination, missing context, partial extraction, etc.)
   - Model confidence level
4. Submit all annotations at once
5. **Annotations become read-only** after submission (cannot be changed)
6. Access historical extractions anytime from the sidebar

### 📊 Comprehensive Metrics Dashboard
- **Faithfulness Score**: How well the model grounds responses in retrieved context
- **Retrieval Precision**: Quality of document retrieval system
- **Field Accuracy**: Percentage of correctly extracted fields
- **Success Rate**: Records processed without errors
- **Error Analysis**: Categorized breakdowns by error type

### 📄 Export Reports in Multiple Formats
- **PDF Report**: Professional diagnostic report with:
  - Executive summary
  - Key performance metrics with formulas
  - Diagnostic framework analysis
  - Error breakdowns
  - Human annotation details
  - Actionable recommendations
- **JSON Export**: Raw annotation data for programmatic analysis

### 🗂️ Persistent History
- All submitted extractions saved to PostgreSQL database
- Sidebar shows unique submitted extractions with annotation stats
- Click any historical extraction to view annotations (read-only)
- Never lose your evaluation work

### 🔐 Multi-User Authentication
- Secure signup/login with JWT authentication
- Each user has isolated extractions and annotations
- Protected routes ensure data privacy

---

## 🧠 Diagnostic Framework

RAG Inspector evaluates pipelines along two orthogonal axes:

### 1️⃣ Faithfulness (Generation Quality)
```
Faithfulness = Correct Fields / Total Annotated Fields
```
- **High faithfulness** → Model respects context
- **Low faithfulness** → Hallucination or context misuse

### 2️⃣ Retrieval Precision (Context Relevance)
```
Retrieval Precision = Relevant Context / Retrieved Context
```
- **High precision** → Retrieval system finds relevant chunks
- **Low precision** → Retrieval needs optimization

### 3️⃣ End-to-End Accuracy
```
Field Accuracy = Correct Fields / Total Fields
```

### 🧩 Diagnostic Interpretation Matrix

| Faithfulness | Retrieval | Diagnosis |
|-------------|-----------|-----------|
| High | High | ✅ Pipeline Healthy |
| High | Low | ⚠️ Retrieval Problem |
| Low | High | ⚠️ Generation/Hallucination Problem |
| Low | Low | 🚨 Entire Pipeline Broken |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Recoil** for state management
- **Tailwind CSS** for styling
- **Vite** for fast development
- **jsPDF** for PDF report generation
- **Lucide Icons** for UI

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** for persistent storage
- **JWT** for authentication
- **Zod** for request validation
- **bcrypt** for password hashing

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or cloud)

### 1. Clone the Repository
```bash
git clone https://github.com/artypratham/RAGInspector.git
cd RAGInspector
```

### 2. Setup Frontend
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your backend API URL to .env
# VITE_API_URL=http://localhost:5000/api
```

### 3. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure database and JWT secret in .env
# DATABASE_URL=postgresql://user:password@localhost:5432/raginspector
# JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Open Application
Visit [http://localhost:5173](http://localhost:5173) and sign up to start annotating!

---

## 📋 Usage Workflow

### Step 1: Upload Data
Paste or upload two JSON inputs:
1. **Schema JSON**: Defines expected fields with descriptions
2. **Output JSON**: RAG pipeline output with extractions, confidence scores, and retrieved context

### Step 2: Annotate Fields
- Click **Correct** (✓) or **Incorrect** (✗) for each extracted field
- For incorrect fields:
  - Specify the expected value
  - Choose error category (hallucination, missing context, partial extraction, etc.)
  - View retrieved context and confidence scores

### Step 3: Submit Annotations
- Click **Submit All Annotations** when done
- Annotations are saved permanently to database
- Extraction becomes read-only

### Step 4: Download Reports
- **Download PDF Report**: Comprehensive diagnostic report
- **Download JSON**: Raw annotation data for analysis

### Step 5: View History
- Click sidebar toggle to view all submitted extractions
- Click any extraction to view its annotations (read-only)
- See annotation statistics (correct/incorrect/total)

### Step 6: New Analysis
- Click **New Analysis** to start fresh
- Upload new schema/output JSONs and repeat

---

## 📂 Input Format

RAG Inspector expects raw pipeline logs in the following format:

### Schema Block
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "loan_amount": {
        "type": "string",
        "description": "Total principal amount of the loan"
      },
      "borrower_name": {
        "type": "string",
        "description": "Name of the borrowing entity"
      }
    }
  }
}
```

### Output Block
```json
{
  "success": true,
  "record_id": "rec_001",
  "doc_id": "loan_agreement_2024",
  "extracted_fields": {
    "loan_amount": {
      "value": "USD 50,000,000",
      "confidence": 0.92
    },
    "borrower_name": {
      "value": "Acme Corporation",
      "confidence": 0.88
    }
  },
  "retrieved_context": [
    {
      "field_name": "loan_amount",
      "chunk_id": "chunk_42",
      "page_number": 2,
      "source_text": "The Borrower agrees to borrow USD 50,000,000...",
      "score": 0.85
    }
  ]
}
```

Multiple schema + output pairs can be pasted in a single upload.

---

## 🌍 Production Deployment

RAG Inspector can be deployed **100% free** using:
- **Frontend**: Vercel
- **Backend**: Render.com or Railway
- **Database**: Neon PostgreSQL (serverless)

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step deployment guide**

---

## 📊 Error Categories

RAG Inspector categorizes errors into actionable types:

| Category | Description | Likely Cause |
|----------|-------------|--------------|
| **Hallucination** | Model generated information not in context | Poor faithfulness, LLM issue |
| **Missing Context** | Required information not retrieved | Retrieval failure |
| **Partial Extraction** | Only part of the value extracted | Chunking or parsing issue |
| **Schema Mismatch** | Field type or format incorrect | Schema design or LLM instruction |
| **Interpretation Error** | Context misunderstood | Prompt engineering needed |
| **Low Confidence** | Model uncertainty high | Training data or ambiguity |

---

## 🎯 When to Use RAG Inspector

✅ **Debugging hallucinations** in production RAG systems
✅ **Evaluating new chunking strategies** before deployment
✅ **Comparing prompt versions** with controlled evaluation
✅ **Auditing document intelligence pipelines** for compliance
✅ **Building human-verified evaluation datasets** for training
✅ **Regression testing** after model or retrieval changes

---

## ⚠️ Honest Limitations (By Design)

RAG Inspector is opinionated and transparent:

- **Relevance uses confidence as proxy**, not true embedding similarity
- **Model confidence can be overestimated** (high confidence ≠ correctness)
- **Requires human annotation** for ground truth (not fully automated)
- **Best suited for structured extraction** (JSON schema-based)

These limitations are explicitly documented and surfaced in the UI.

---

## 🧪 Future Roadmap

- [ ] Embedding similarity integration for true retrieval metrics
- [ ] Automatic regression comparison across evaluation runs
- [ ] Model-to-model A/B testing
- [ ] CI-friendly scoring modes with pass/fail thresholds
- [ ] Dataset export for training custom evaluators
- [ ] Bulk import from CSV/Excel
- [ ] Team collaboration features (shared annotations)
- [ ] Advanced filtering and search in history

---

## 🤝 Contributing

Contributions welcome! This project is built for the RAG/LLM community. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use in commercial and open-source projects.

---

## 🙏 Acknowledgments

Built for teams who need **observability over theoretical purity** when debugging production RAG systems.

---

## 🏁 Final Thought

> **You can't fix a RAG pipeline if you don't know where it's breaking.**

RAG Inspector doesn't just score your system — it tells you **what broke, where, and why**, with persistent history and professional reports.

**Get started in 5 minutes** → [Deployment Guide](./DEPLOYMENT.md)
