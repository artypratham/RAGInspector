🔍 RAGInspector
A Diagnostic Framework for Evaluating RAG + LLM Pipelines

RAGInspector is an interactive diagnostic tool that x-rays your Retrieval-Augmented Generation (RAG) pipeline to reveal where it breaks and why — retrieval, generation, or the full pipeline.

Unlike traditional accuracy metrics, RAGInspector separates faithfulness, retrieval relevance, and end-to-end correctness, enabling targeted fixes instead of blind tuning.

🚀 Why RAGInspector?

Most RAG evaluations answer only one question:

“Is the output correct?”

RAGInspector answers the harder (and more useful) questions:

❓ Was the retrieved context relevant?

❓ Was the LLM faithful to that context?

❓ Is the failure caused by retrieval, generation, or both?

❓ Which fields, documents, or schemas are breaking most often?

This tool is built for:

RAG system builders

LLM platform engineers

Document intelligence teams

FinTech / Legal / Enterprise AI use cases

🧠 Core Diagnostic Framework

RAGInspector evaluates a pipeline along two orthogonal axes:

1️⃣ Faithfulness (Generation Quality)

Did the model generate answers grounded in the retrieved source?

Faithfulness = CorrectFields / (CorrectFields + IncorrectFields)


High faithfulness → Model respects context

Low faithfulness → Hallucination or misuse of context

2️⃣ Relevance (Retrieval Quality — Proxy-Based)

Because embedding similarity is not always available at inference time,
RAGInspector uses model-reported confidence + provenance as a proxy signal.

Relevance ≈ Average Field Confidence


⚠️ This is a heuristic, not ground truth — and the UI explicitly surfaces this limitation.

3️⃣ End-to-End Accuracy

Out of everything we expected, how much did the system actually get right?

EndToEndAccuracy = CorrectFields / TotalFields

🧩 Diagnostic Interpretation Matrix
Faithfulness	Relevance	Diagnosis
High	High	✅ Pipeline Healthy (focus on edge cases)
High	Low	⚠️ Retrieval Problem
Low	High	⚠️ Generation / Hallucination Problem
Low	Low	🚨 Entire Pipeline Broken

RAGInspector automatically classifies your pipeline into one of these states.

🖥️ Key Features
✍️ Field-Level Human Annotation

Mark each extracted field as Correct / Incorrect

Provide:

Expected value

Error category

Free-text reasoning

🔗 Provenance-Aware Inspection

View exact:

Source text

Page number

Section ID

Character offsets

Validate grounding visually

📊 Automatic Metrics

Faithfulness score

Retrieval relevance (proxy)

End-to-end accuracy

Error rate

Annotation progress

🧠 Intelligent Error Analysis

Errors are grouped into actionable categories:

Hallucination

Context missing

Partial extraction

Schema mismatch

Interpretation errors

Source quality issues

Includes retrieval vs generation blame split.

📤 Exportable Evaluation Reports

One-click JSON export

Suitable for:

Offline analysis

CI evaluation

Regression tracking

Model comparisons

📂 Supported Input Format

RAGInspector expects raw pipeline logs, not synthetic datasets.

Schema Block
{
  "schema": {
    "type": "object",
    "properties": {
      "loan_amount": {
        "type": "string",
        "description": "Total principal amount of the loan"
      }
    }
  }
}

Response Block
{
  "success": true,
  "doc_id": "doc_123",
  "extraction": {
    "loan_amount": "USD 50,000,000"
  },
  "provenance": {
    "loan_amount": {
      "confidence": 0.85,
      "source": {
        "page_number": 2,
        "source_text": "The Borrower agrees to borrow USD 50,000,000..."
      }
    }
  }
}


Multiple schema + response pairs can be pasted or uploaded in a single run.

🛠️ Tech Stack

React

Tailwind CSS

Lucide Icons

Fully client-side (no backend required)

⚠️ Honest Limitations (By Design)

RAGInspector is opinionated and transparent:

Relevance is proxy-based, not true semantic similarity

Model confidence can be overestimated

High confidence ≠ correctness

This tool prioritizes observability over theoretical purity

These limitations are explicitly documented and surfaced in the UI.

🎯 When to Use RAGInspector

✅ Debugging hallucinations
✅ Evaluating new chunking strategies
✅ Comparing prompt versions
✅ Auditing document intelligence pipelines
✅ Building human-verified evaluation datasets

🧪 Future Extensions (Planned)

Embedding similarity integration

Automatic regression comparison

Model-to-model evaluation

CI-friendly scoring modes

Dataset export for training evaluators

🏁 Final Thought

You can’t fix a RAG pipeline if you don’t know where it’s lying.

RAGInspector doesn’t just score your system —
it tells you what broke, where, and why.