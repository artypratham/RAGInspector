import { useState, useRef } from "react"
import { useRecoilState } from "recoil"
import { rawInputAtom, recordsAtom } from "../../state/atom"
import { parsePipelineData } from "../../logic/parser"
import { transformToRecords } from "../../logic/transformer"
import { Activity, Upload, FileText, Sparkles, AlertCircle, X } from "lucide-react"

const SAMPLE_DATA = `{
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
}

{
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
  const [raw, setRaw] = useRecoilState(rawInputAtom)
  const [, setRecords] = useRecoilState(recordsAtom)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleParse() {
    try {
      setError(null)
      const pairs = parsePipelineData(raw)
      const records = transformToRecords(pairs)
      setRecords(records)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
    }
  }

  function loadSampleData() {
    setRaw(SAMPLE_DATA)
  }

  function handleFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setRaw(text)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/json" || file.name.endsWith(".txt") || file.name.endsWith(".log"))) {
      handleFileUpload(file)
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl">
            <Activity className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">RAG Pipeline Diagnostics</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your pipeline logs or paste extraction data to analyze RAG performance,
            identify errors, and improve your system.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Upload File</h3>
                <p className="text-sm text-slate-400">JSON, TXT, or LOG files</p>
              </div>
            </div>
          </button>

          <button
            onClick={loadSampleData}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Load Sample</h3>
                <p className="text-sm text-slate-400">Try with demo data</p>
              </div>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,.log"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? "border-cyan-500 bg-cyan-500/10"
              : "border-slate-700/50 bg-slate-900/50"
          } backdrop-blur-sm`}
        >
          <div className="absolute top-4 right-4">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <textarea
            className="w-full h-96 p-6 bg-transparent border-0 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none"
            placeholder="Paste your schema + extraction logs here, or drag and drop a file..."
            value={raw}
            onChange={e => setRaw(e.target.value)}
          />
        </div>

        {error && (
          <div className="relative rounded-xl border border-red-500/50 bg-red-500/10 backdrop-blur-sm p-4">
            <button
              onClick={() => setError(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Parse Error</h3>
                <p className="text-red-300/90 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={!raw.trim()}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
        >
          Parse & Analyze Pipeline Data
        </button>

        <div className="flex items-center gap-6 justify-center text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Schema detection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>Field extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Context retrieval</span>
          </div>
        </div>
      </div>
    </div>
  )
}
