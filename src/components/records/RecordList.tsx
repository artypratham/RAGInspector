import { useState, useMemo } from "react"
import { useRecoilValue } from "recoil"
import { recordsAtom, annotationsAtom } from "../../state/atom"
import RecordCard from "./RecordCard"
import { Search, Filter, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react"

type FilterType = "all" | "annotated" | "pending" | "correct" | "incorrect" | "review"

export default function RecordList() {
  const records = useRecoilValue(recordsAtom)
  const annotations = useRecoilValue(annotationsAtom)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const filteredRecords = useMemo(() => {
    let filtered = records

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record =>
        record.doc_id.toLowerCase().includes(query) ||
        record.record_id.toLowerCase().includes(query) ||
        Object.keys(record.input_schema).some(field => field.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(record => {
        const recordAnnotations = annotations[record.record_id] || {}
        const fields = Object.keys(record.input_schema)
        const annotatedFields = fields.filter(f => recordAnnotations[f]?.status)
        const correctFields = fields.filter(f => recordAnnotations[f]?.status === "correct")
        const incorrectFields = fields.filter(f => recordAnnotations[f]?.status === "incorrect")
        const reviewFields = fields.filter(f => record.extracted_fields[f]?.requires_review)

        switch (activeFilter) {
          case "annotated":
            return annotatedFields.length === fields.length
          case "pending":
            return annotatedFields.length < fields.length
          case "correct":
            return correctFields.length > 0
          case "incorrect":
            return incorrectFields.length > 0
          case "review":
            return reviewFields.length > 0
          default:
            return true
        }
      })
    }

    return filtered
  }, [records, annotations, searchQuery, activeFilter])

  const filterOptions: { value: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "all", label: "All Records", icon: FileText },
    { value: "pending", label: "Pending", icon: AlertCircle },
    { value: "annotated", label: "Fully Annotated", icon: CheckCircle2 },
    { value: "correct", label: "Has Correct", icon: CheckCircle2 },
    { value: "incorrect", label: "Has Errors", icon: XCircle },
    { value: "review", label: "Needs Review", icon: AlertCircle }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document ID, record ID, or field name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as FilterType)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-400">
          Showing {filteredRecords.length} of {records.length} records
        </p>
        {activeFilter !== "all" && (
          <button
            onClick={() => setActiveFilter("all")}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Records Found</h3>
          <p className="text-slate-400">
            {searchQuery ? `No records match "${searchQuery}"` : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(r => (
            <RecordCard
              key={r.record_id}
              record={r}
            />
          ))}
        </div>
      )}
    </div>
  )
}
