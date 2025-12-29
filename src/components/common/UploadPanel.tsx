import { useState, useRef } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { schemaInputAtom, outputJsonAtom, recordsAtom, currentExtractionIdAtom, extractionsAtom, annotationsAtom, isAnnotationSubmittedAtom } from "../../state/atom"
import { parseSeparateInputs } from "../../logic/parser"
import { transformToRecords } from "../../logic/transformer"
import { api } from "../../services/api"
import { Activity, Upload, FileText, Sparkles, AlertCircle, X, Save, CheckCircle } from "lucide-react"

const SAMPLE_SCHEMA = `{
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
}`

const SAMPLE_OUTPUT = `{
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
  const [schemaInput, setSchemaInput] = useRecoilState(schemaInputAtom)
  const [outputJson, setOutputJson] = useRecoilState(outputJsonAtom)
  const [, setRecords] = useRecoilState(recordsAtom)
  const setCurrentExtractionId = useSetRecoilState(currentExtractionIdAtom)
  const setExtractions = useSetRecoilState(extractionsAtom)
  const setAnnotations = useSetRecoilState(annotationsAtom)
  const setIsSubmitted = useSetRecoilState(isAnnotationSubmittedAtom)
  const [isDraggingSchema, setIsDraggingSchema] = useState(false)
  const [isDraggingOutput, setIsDraggingOutput] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const schemaFileInputRef = useRef<HTMLInputElement>(null)
  const outputFileInputRef = useRef<HTMLInputElement>(null)

  async function handleParse() {
    try {
      setError(null)
      setSuccess(null)
      setSaving(true)

      const pairs = parseSeparateInputs(schemaInput, outputJson)
      const records = transformToRecords(pairs)
      setRecords(records)

      // Reset annotations and submission status for new extraction
      setAnnotations({})
      setIsSubmitted(false)
      setCurrentExtractionId(null)

      setSuccess("Data loaded successfully! Start annotating fields.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data')
    } finally {
      setSaving(false)
    }
  }

  function loadSampleData() {
    setSchemaInput(SAMPLE_SCHEMA)
    setOutputJson(SAMPLE_OUTPUT)
  }

  function handleSchemaFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setSchemaInput(text)
    }
    reader.readAsText(file)
    setSchemaInput(SAMPLE_SCHEMA)
    setOutputJson(SAMPLE_OUTPUT)
  }

  function handleSchemaFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setSchemaInput(text)
    }
    reader.readAsText(file)
  }

  function handleOutputFileUpload(file: File) {
  function handleOutputFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setOutputJson(text)
      setOutputJson(text)
    }
    reader.readAsText(file)
  }

  function handleSchemaDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingSchema(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/json" || file.name.endsWith(".txt") || file.name.endsWith(".log"))) {
      handleSchemaFileUpload(file)
    }
  }

  function handleOutputDrop(e: React.DragEvent) {
  function handleSchemaDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingSchema(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/json" || file.name.endsWith(".txt") || file.name.endsWith(".log"))) {
      handleSchemaFileUpload(file)
    }
  }

  function handleOutputDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingOutput(false)
    setIsDraggingOutput(false)

    const file = e.dataTransfer.files[0]
    if (file && (file.type === "application/json" || file.name.endsWith(".txt") || file.name.endsWith(".log"))) {
      handleOutputFileUpload(file)
      handleOutputFileUpload(file)
    }
  }

  function handleSchemaDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingSchema(true)
  }

  function handleSchemaDragLeave() {
    setIsDraggingSchema(false)
  }

  function handleOutputDragOver(e: React.DragEvent) {
  function handleSchemaDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingSchema(true)
  }

  function handleSchemaDragLeave() {
    setIsDraggingSchema(false)
  }

  function handleOutputDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDraggingOutput(true)
    setIsDraggingOutput(true)
  }

  function handleOutputDragLeave() {
    setIsDraggingOutput(false)
  function handleOutputDragLeave() {
    setIsDraggingOutput(false)
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

        <div className="flex justify-center">
        <div className="flex justify-center">
          <button
            onClick={loadSampleData}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 px-8 py-3"
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 px-8 py-3"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Load Sample Data</span>
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Load Sample Data</span>
            </div>
          </button>
        </div>

        <input
          ref={schemaFileInputRef}
          type="file"
          accept=".json,.txt,.log"
          onChange={(e) => e.target.files?.[0] && handleSchemaFileUpload(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={outputFileInputRef}
          ref={schemaFileInputRef}
          type="file"
          accept=".json,.txt,.log"
          onChange={(e) => e.target.files?.[0] && handleSchemaFileUpload(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={outputFileInputRef}
          type="file"
          accept=".json,.txt,.log"
          onChange={(e) => e.target.files?.[0] && handleOutputFileUpload(e.target.files[0])}
          onChange={(e) => e.target.files?.[0] && handleOutputFileUpload(e.target.files[0])}
          className="hidden"
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Schema Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Input Schema
              </h3>
              <button
                onClick={() => schemaFileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/50 transition-all text-sm text-slate-400 hover:text-white"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <div
              onDrop={handleSchemaDrop}
              onDragOver={handleSchemaDragOver}
              onDragLeave={handleSchemaDragLeave}
              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDraggingSchema
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700/50 bg-slate-900/50"
              } backdrop-blur-sm`}
            >
              <div className="absolute top-3 right-3">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <textarea
                className="w-full h-80 p-4 bg-transparent border-0 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none"
                placeholder='Paste your input schema here...\n\nExample:\n{\n  "input_schema": {\n    "field_name": {\n      "type": "string",\n      "description": "..."\n    }\n  }\n}'
                value={schemaInput}
                onChange={e => setSchemaInput(e.target.value)}
              />
            </div>
          </div>

          {/* Output JSON Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                Output JSON
              </h3>
              <button
                onClick={() => outputFileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/50 transition-all text-sm text-slate-400 hover:text-white"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <div
              onDrop={handleOutputDrop}
              onDragOver={handleOutputDragOver}
              onDragLeave={handleOutputDragLeave}
              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDraggingOutput
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700/50 bg-slate-900/50"
              } backdrop-blur-sm`}
            >
              <div className="absolute top-3 right-3">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <textarea
                className="w-full h-80 p-4 bg-transparent border-0 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none"
                placeholder='Paste your extraction output here...\n\nExample:\n{\n  "record_id": "...",\n  "success": true,\n  "extracted_fields": {...}\n}'
                value={outputJson}
                onChange={e => setOutputJson(e.target.value)}
              />
            </div>
          </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Schema Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Input Schema
              </h3>
              <button
                onClick={() => schemaFileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/50 transition-all text-sm text-slate-400 hover:text-white"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <div
              onDrop={handleSchemaDrop}
              onDragOver={handleSchemaDragOver}
              onDragLeave={handleSchemaDragLeave}
              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDraggingSchema
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-slate-700/50 bg-slate-900/50"
              } backdrop-blur-sm`}
            >
              <div className="absolute top-3 right-3">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <textarea
                className="w-full h-80 p-4 bg-transparent border-0 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none"
                placeholder='Paste your input schema here...\n\nExample:\n{\n  "input_schema": {\n    "field_name": {\n      "type": "string",\n      "description": "..."\n    }\n  }\n}'
                value={schemaInput}
                onChange={e => setSchemaInput(e.target.value)}
              />
            </div>
          </div>

          {/* Output JSON Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                Output JSON
              </h3>
              <button
                onClick={() => outputFileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:border-cyan-500/50 transition-all text-sm text-slate-400 hover:text-white"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
            <div
              onDrop={handleOutputDrop}
              onDragOver={handleOutputDragOver}
              onDragLeave={handleOutputDragLeave}
              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDraggingOutput
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700/50 bg-slate-900/50"
              } backdrop-blur-sm`}
            >
              <div className="absolute top-3 right-3">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <textarea
                className="w-full h-80 p-4 bg-transparent border-0 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 resize-none"
                placeholder='Paste your extraction output here...\n\nExample:\n{\n  "record_id": "...",\n  "success": true,\n  "extracted_fields": {...}\n}'
                value={outputJson}
                onChange={e => setOutputJson(e.target.value)}
              />
            </div>
          </div>
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

        {success && (
          <div className="relative rounded-xl border border-emerald-500/50 bg-emerald-500/10 backdrop-blur-sm p-4">
            <button
              onClick={() => setSuccess(null)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              <X className="w-4 h-4 text-emerald-400" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-emerald-400 font-semibold mb-1">Success!</h3>
                <p className="text-emerald-300/90 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={!schemaInput.trim() || !outputJson.trim() || saving}
          className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Save className="w-5 h-5 animate-pulse" />
              <span>Saving & Analyzing...</span>
            </>
          ) : (
            <span>Parse & Analyze Pipeline Data</span>
          )}
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