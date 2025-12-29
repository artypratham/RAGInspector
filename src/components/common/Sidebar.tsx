import { useEffect } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import {
  extractionsAtom,
  currentExtractionIdAtom,
  sidebarOpenAtom,
  schemaInputAtom,
  outputJsonAtom,
  recordsAtom,
  annotationsAtom,
  isAnnotationSubmittedAtom
} from "../../state/atom"
import { api } from "../../services/api"
import { parseSeparateInputs } from "../../logic/parser"
import { transformToRecords } from "../../logic/transformer"
import { Clock, FileText, Trash2, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import type { AnnotationState } from "../../types/annotation"

export default function Sidebar() {
  const [extractions, setExtractions] = useRecoilState(extractionsAtom)
  const [currentExtractionId, setCurrentExtractionId] = useRecoilState(currentExtractionIdAtom)
  const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenAtom)
  const setSchemaInput = useSetRecoilState(schemaInputAtom)
  const setOutputJson = useSetRecoilState(outputJsonAtom)
  const setRecords = useSetRecoilState(recordsAtom)
  const setAnnotations = useSetRecoilState(annotationsAtom)
  const setIsSubmitted = useSetRecoilState(isAnnotationSubmittedAtom)

  useEffect(() => {
    loadExtractions()
  }, [])

  async function loadExtractions() {
    const response = await api.getExtractions(50, 0)
    if (response.data) {
      // Filter to show only submitted extractions
      const submittedExtractions = response.data.extractions.filter(
        (ext: any) => ext.submittedAt !== null && ext.submittedAt !== undefined
      )
      setExtractions(submittedExtractions)
    }
  }

  async function loadExtraction(id: string) {
    const response = await api.getExtraction(id)
    if (response.data) {
      const extraction = response.data.extraction
      setCurrentExtractionId(id)
      setSchemaInput(extraction.schemaInput)
      setOutputJson(extraction.outputJson)

      try {
        const pairs = parseSeparateInputs(extraction.schemaInput, extraction.outputJson)
        const records = transformToRecords(pairs)
        setRecords(records)

        // Reconstruct annotations from backend data
        const annotationsState: AnnotationState = {}
        if (extraction.annotations && extraction.annotations.length > 0) {
          extraction.annotations.forEach((ann: any) => {
            if (!annotationsState[ann.recordId]) {
              annotationsState[ann.recordId] = {}
            }
            annotationsState[ann.recordId][ann.fieldName] = {
              status: ann.status,
              extracted_value: ann.extractedValue,
              expected_value: ann.expectedValue,
              category: ann.category,
              confidence: ann.confidence
            }
          })
          
        }
        setAnnotations(annotationsState)

        // Mark as submitted (read-only)
        setIsSubmitted(true)
      } catch (error) {
        console.error("Error parsing extraction:", error)
      }
    }
  }

  async function deleteExtraction(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this extraction?")) return

    const response = await api.deleteExtraction(id)
    if (response.data) {
      setExtractions(extractions.filter(ext => ext.id !== id))
      if (currentExtractionId === id) {
        setCurrentExtractionId(null)
        setSchemaInput("")
        setOutputJson("")
        setRecords([])
        setAnnotations({})
        setIsSubmitted(false)
      }
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  function getAnnotationCount(extraction: any): { correct: number; incorrect: number; total: number } {
    if (!extraction.annotations || extraction.annotations.length === 0) {
      return { correct: 0, incorrect: 0, total: 0 }
    }
    const correct = extraction.annotations.filter((a: any) => a.status === 'correct').length
    const incorrect = extraction.annotations.filter((a: any) => a.status === 'incorrect').length
    return { correct, incorrect, total: extraction.annotations.length }
  }

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-500/50 transition-all"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <div
        className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 pt-8">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Submitted Extractions</h2>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
            {extractions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No submitted extractions yet</p>
                <p className="text-xs mt-1">Annotate and submit to see them here</p>
              </div>
            ) : (
              extractions.map((extraction) => {
                const stats = getAnnotationCount(extraction)
                return (
                  <div
                    key={extraction.id}
                    onClick={() => loadExtraction(extraction.id)}
                    className={`group relative p-4 rounded-lg cursor-pointer transition-all ${
                      currentExtractionId === extraction.id
                        ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                        : "bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {extraction.title || "Untitled Extraction"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(extraction.submittedAt || extraction.createdAt)}</span>
                        </div>
                        {stats.total > 0 && (
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            {/* <span className="text-emerald-400">{stats.correct} ✓</span>
                            <span className="text-red-400">{stats.incorrect} ✗</span> */}
                            <span className="text-slate-500">{stats.total} total</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteExtraction(extraction.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
