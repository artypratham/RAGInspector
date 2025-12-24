import { useRecoilValue } from "recoil"
import { recordsAtom, annotationsAtom } from "../../state/atom"
import RecordCard from "./RecordCard"

export default function RecordList() {
  const records = useRecoilValue(recordsAtom)
  const annotations = useRecoilValue(annotationsAtom)

  return (
    <div className="space-y-4">
      {records.map(r => (
        <RecordCard
          key={r.record_id}
          record={r}
          annotations={annotations[r.record_id] || {}}
        />
      ))}
    </div>
  )
}
