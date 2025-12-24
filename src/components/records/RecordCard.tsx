import { useState } from "react"
import type { RecordData } from "../../types/pipeline"
import FieldAnnotation from "./FieldAnnotation"

export default function RecordCard({
  record,
  annotations
}: {
  record: RecordData
  annotations: any
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-700 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex justify-between bg-slate-800"
      >
        <span>{record.doc_id}</span>
        <span>{open ? "▼" : "▶"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {Object.keys(record.input_schema).map(field => (
            <FieldAnnotation
              key={field}
              record={record}
              field={field}
              annotation={annotations[field]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
