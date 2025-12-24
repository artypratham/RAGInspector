import { useRecoilState } from "recoil"
import { rawInputAtom, recordsAtom } from "../../state/atom"
import { parsePipelineData } from "../../logic/parser"
import { transformToRecords } from "../../logic/transformer"

export default function UploadPanel() {
  const [raw, setRaw] = useRecoilState(rawInputAtom)
  const [, setRecords] = useRecoilState(recordsAtom)

  function handleParse() {
    const pairs = parsePipelineData(raw)
    const records = transformToRecords(pairs)
    setRecords(records)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">RAG Pipeline Diagnostics</h1>

      <textarea
        className="w-full h-96 p-4 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm"
        placeholder="Paste schema + extraction logs here"
        value={raw}
        onChange={e => setRaw(e.target.value)}
      />

      <button
        onClick={handleParse}
        className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-semibold"
      >
        Parse & Analyze
      </button>
    </div>
  )
}
