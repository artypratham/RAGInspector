import { useState, useMemo } from "react"
import { useRecoilValue } from "recoil"
import { annotationsAtom } from "../../state/atom"
import type { RecordData } from "../../types/pipeline"
import FieldAnnotation from "./FieldAnnotation"
import { ChevronDown, ChevronRight, FileText, CheckCircle2, XCircle, AlertCircle, Activity } from "lucide-react"

export default function RecordCard({
  record
}: {
  record: RecordData
}) {
  const [open, setOpen] = useState(false)
  const annotations = useRecoilValue(annotationsAtom)

  const fieldStats = useMemo(() => {
    const recordAnnotations = annotations[record.record_id] || {}
    const fields = Object.keys(record.input_schema)
    const correct = fields.filter(f => recordAnnotations[f]?.status === "correct").length
    const incorrect = fields.filter(f => recordAnnotations[f]?.status === "incorrect").length
    const pending = fields.length - correct - incorrect

    const avgConfidence = fields.reduce((sum, field) =>
      sum + (record.extracted_fields[field]?.confidence || 0), 0
    ) / fields.length

    return { total: fields.length, correct, incorrect, pending, avgConfidence }
  }, [record, annotations])

  const statusColor = record.success ? "from-emerald-500 to-teal-600" : "from-red-500 to-rose-600"

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-slate-600 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${statusColor} opacity-0 group-hover:opacity-5 transition-opacity`} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between relative"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${statusColor} shadow-lg`}>
            <FileText className="w-5 h-5 text-white" />
          </div>

          <div className="text-left flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-white">{record.doc_id}</h3>
              {record.success ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Success
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  <XCircle className="w-3 h-3" /> Failed
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {fieldStats.total} fields
              </span>
              {fieldStats.correct > 0 && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {fieldStats.correct} correct
                </span>
              )}
              {fieldStats.incorrect > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="w-3.5 h-3.5" />
                  {fieldStats.incorrect} incorrect
                </span>
              )}
              {fieldStats.pending > 0 && (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldStats.pending} pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 mb-1">Avg. Confidence</div>
            <div className={`text-lg font-bold ${
              fieldStats.avgConfidence >= 0.8 ? "text-emerald-400" :
              fieldStats.avgConfidence >= 0.5 ? "text-amber-400" :
              "text-red-400"
            }`}>
              {(fieldStats.avgConfidence * 100).toFixed(0)}%
            </div>
          </div>

          <div className="text-slate-400">
            {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700/50 p-5 space-y-4 relative bg-slate-900/30">
          <div className="mb-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-300">Annotation Progress</h4>
              <span className="text-sm font-semibold text-white">
                {((fieldStats.correct + fieldStats.incorrect) / fieldStats.total * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-600"
                  style={{ width: `${(fieldStats.correct / fieldStats.total) * 100}%` }}
                />
                <div
                  className="bg-gradient-to-r from-red-500 to-rose-600"
                  style={{ width: `${(fieldStats.incorrect / fieldStats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {Object.keys(record.input_schema).map(field => (
            <FieldAnnotation
              key={field}
              record={record}
              field={field}
            />
          ))}
        </div>
      )}
    </div>
  )
}
