import { useRecoilState } from "recoil"
import { annotationsAtom } from "../../state/atom"
import type { RecordData } from "../../types/pipeline"

export default function FieldAnnotation({
  record,
  field,
  annotation
}: {
  record: RecordData
  field: string
  annotation: any
}) {
  const [annotations, setAnnotations] = useRecoilState(annotationsAtom)
  const extracted = record.extracted_fields[field]

  function mark(status: "correct" | "incorrect") {
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
  }

  return (
    <div className="p-4 border border-slate-600 rounded-lg space-y-2">
      <div className="flex justify-between">
        <strong>{field}</strong>
        <span className="text-sm text-slate-400">
          {(extracted.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="font-mono text-sm bg-slate-900 p-2 rounded">
        {extracted.value ?? "null"}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => mark("correct")}
          className="px-3 py-1 bg-emerald-600 rounded"
        >
          Correct
        </button>
        <button
          onClick={() => mark("incorrect")}
          className="px-3 py-1 bg-rose-600 rounded"
        >
          Incorrect
        </button>
      </div>
    </div>
  )
}
