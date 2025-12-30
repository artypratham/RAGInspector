import { useState } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import {
  schemaInputAtom,
  outputJsonAtom,
  recordsAtom,
  currentExtractionIdAtom,
  annotationsAtom,
  isAnnotationSubmittedAtom,
} from "../../state/atom"
import { parseSeparateInputs } from "../../logic/parser"
import { transformToRecords } from "../../logic/transformer"
import {
  Activity,
  Sparkles,
} from "lucide-react"

const SAMPLE_SCHEMA = `{
  "input_schema": {
    "borrower_name": {
      "type": "string",
      "description": "Full legal name of the borrower"
    },
    "loan_amount": {
      "type": "number",
      "description": "Total loan amount in USD"
    }
  }
}`

const SAMPLE_OUTPUT = `{
  "record_id": "rec_001",
  "doc_id": "loan_application_123.pdf",
  "success": true,
  "extracted_fields": {
    "borrower_name": {
      "value": "John Smith",
      "confidence": 0.95,
      "requires_review": false
    },
    "loan_amount": {
      "value": "250000",
      "confidence": 0.88,
      "requires_review": false
    }
  },
  "retrieved_context": [
    {
      "field_name": "borrower_name",
      "text": "Borrower: John Smith",
      "page_number": 1
    },
    {
      "field_name": "loan_amount",
      "text": "Loan Amount: $250,000",
      "page_number": 1
    }
  ]
}`

export default function UploadPanel() {
  const [schemaInput, setSchemaInput] = useRecoilState(schemaInputAtom)
  const [outputJson, setOutputJson] = useRecoilState(outputJsonAtom)
  const [, setRecords] = useRecoilState(recordsAtom)

  const setCurrentExtractionId = useSetRecoilState(currentExtractionIdAtom)
  const setAnnotations = useSetRecoilState(annotationsAtom)
  const setIsSubmitted = useSetRecoilState(isAnnotationSubmittedAtom)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleParse() {
    try {
      setError(null)
      setSuccess(null)
      setSaving(true)

      const pairs = parseSeparateInputs(schemaInput, outputJson)
      const records = transformToRecords(pairs)
      setRecords(records)

      setAnnotations({})
      setIsSubmitted(false)
      setCurrentExtractionId(null)

      setSuccess("Data loaded successfully! Start annotating fields.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse data")
    } finally {
      setSaving(false)
    }
  }

  function loadSampleData() {
    setSchemaInput(SAMPLE_SCHEMA)
    setOutputJson(SAMPLE_OUTPUT)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            RAG Pipeline Diagnostics
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your pipeline logs or paste extraction data to analyze RAG
            performance, identify errors, and improve your system.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={loadSampleData}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 px-8 py-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">
                Load Sample Data
              </span>
            </div>
          </button>
        </div>

        {/* INPUT AREAS (UNCHANGED STYLING) */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Schema */}
          <div className="space-y-3">
            <textarea
              className="w-full h-80 p-4 bg-transparent border-2 border-dashed border-slate-700/50 rounded-xl font-mono text-xs text-white"
              value={schemaInput}
              onChange={e => setSchemaInput(e.target.value)}
            />
          </div>

          {/* Output */}
          <div className="space-y-3">
            <textarea
              className="w-full h-80 p-4 bg-transparent border-2 border-dashed border-slate-700/50 rounded-xl font-mono text-xs text-white"
              value={outputJson}
              onChange={e => setOutputJson(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="text-red-400">{error}</div>}
        {success && <div className="text-emerald-400">{success}</div>}

        <button
          onClick={handleParse}
          disabled={!schemaInput.trim() || !outputJson.trim() || saving}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-semibold"
        >
          {saving ? "Saving & Analyzing..." : "Parse & Analyze Pipeline Data"}
        </button>
      </div>
    </div>
  )
}
