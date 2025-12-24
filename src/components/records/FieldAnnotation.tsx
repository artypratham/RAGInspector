import { useState } from "react"
import { useRecoilState } from "recoil"
import { annotationsAtom } from "../../state/atom"
import type { RecordData } from "../../types/pipeline"
import { CheckCircle, XCircle, AlertTriangle, FileText, Database, TrendingUp } from "lucide-react"

const ERROR_CATEGORIES = [
  { value: "hallucination", label: "Hallucination", icon: AlertTriangle, color: "text-red-400" },
  { value: "retrieval", label: "Retrieval Failure", icon: Database, color: "text-orange-400" },
  { value: "extraction", label: "Extraction Error", icon: FileText, color: "text-yellow-400" },
  { value: "formatting", label: "Formatting Issue", icon: TrendingUp, color: "text-blue-400" }
]

export default function FieldAnnotation({
  record,
  field
}: {
  record: RecordData
  field: string
}) {
  const [annotations, setAnnotations] = useRecoilState(annotationsAtom)
  const extracted = record.extracted_fields[field]
  const schema = record.input_schema[field]
  const currentAnnotation = annotations[record.record_id]?.[field]

  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [expectedValue, setExpectedValue] = useState("")

  const contextForField = record.retrieved_context.filter(ctx => ctx.field_name === field)

  function mark(status: "correct" | "incorrect") {
    if (status === "incorrect") {
      setShowCategorySelect(true)
    } else {
      setAnnotations(prev => ({
        ...prev,
        [record.record_id]: {
          ...prev[record.record_id],
          [field]: {
            status,
            extracted_value: extracted.value ?? undefined,
            confidence: extracted.confidence
          }
        }
      }))
      setShowCategorySelect(false)
      setSelectedCategory("")
      setExpectedValue("")
    }
  }

  function submitIncorrect() {
    setAnnotations(prev => ({
      ...prev,
      [record.record_id]: {
        ...prev[record.record_id],
        [field]: {
          status: "incorrect",
          extracted_value: extracted.value ?? undefined,
          confidence: extracted.confidence,
          category: selectedCategory || "other",
          expected_value: expectedValue || undefined
        }
      }
    }))
    setShowCategorySelect(false)
  }

  const isCorrect = currentAnnotation?.status === "correct"
  const isIncorrect = currentAnnotation?.status === "incorrect"

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-slate-600 transition-all duration-300">
      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-white">{field}</h4>
              {isCorrect && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Correct
                </span>
              )}
              {isIncorrect && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  <XCircle className="w-3 h-3" /> Incorrect
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{schema.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
              extracted.confidence >= 0.8 ? "bg-emerald-500/20 text-emerald-400" :
              extracted.confidence >= 0.5 ? "bg-amber-500/20 text-amber-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {(extracted.confidence * 100).toFixed(0)}%
            </div>
            {extracted.requires_review && (
              <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs font-semibold">
                Review
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Extracted Value
          </label>
          <div className="font-mono text-sm bg-slate-900/70 border border-slate-700/50 p-3 rounded-lg text-cyan-300">
            {extracted.value ?? <span className="text-slate-500 italic">null</span>}
          </div>
        </div>

        {contextForField.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Source Context
            </label>
            <div className="space-y-2">
              {contextForField.map((ctx, idx) => (
                <div key={idx} className="bg-slate-900/70 border border-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs text-slate-500">
                      {ctx.page_number && `Page ${ctx.page_number}`}
                      {ctx.section_id && ` • ${ctx.section_id}`}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-mono">{ctx.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!currentAnnotation && !showCategorySelect && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => mark("correct")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Correct
            </button>
            <button
              onClick={() => mark("incorrect")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" /> Incorrect
            </button>
          </div>
        )}

        {showCategorySelect && (
          <div className="space-y-3 pt-2 border-t border-slate-700/50">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Error Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ERROR_CATEGORIES.map(cat => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedCategory === cat.value
                        ? "border-cyan-500 bg-cyan-500/20"
                        : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="text-sm text-white">{cat.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expected Value (Optional)
              </label>
              <input
                type="text"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                placeholder="Enter the correct value..."
                className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={submitIncorrect}
                disabled={!selectedCategory}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                Submit Annotation
              </button>
              <button
                onClick={() => {
                  setShowCategorySelect(false)
                  setSelectedCategory("")
                  setExpectedValue("")
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentAnnotation && (
          <div className="pt-2 border-t border-slate-700/50">
            {isIncorrect && currentAnnotation.category && (
              <div className="mb-2">
                <span className="text-xs text-slate-400">Category: </span>
                <span className="text-sm text-white font-medium">
                  {ERROR_CATEGORIES.find(c => c.value === currentAnnotation.category)?.label || currentAnnotation.category}
                </span>
              </div>
            )}
            {currentAnnotation.expected_value && (
              <div className="mb-2">
                <span className="text-xs text-slate-400">Expected: </span>
                <span className="text-sm text-emerald-400 font-mono">{currentAnnotation.expected_value}</span>
              </div>
            )}
            <button
              onClick={() => {
                setAnnotations(prev => {
                  const updated = { ...prev }
                  if (updated[record.record_id]) {
                    delete updated[record.record_id][field]
                  }
                  return updated
                })
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Clear annotation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
