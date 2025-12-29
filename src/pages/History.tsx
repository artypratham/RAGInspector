import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSetRecoilState } from "recoil"
import Header from "../components/common/Header"
import Sidebar from "../components/common/Sidebar"
import { api } from "../services/api"
import { Clock, FileText, ChevronRight, Download } from "lucide-react"
import { recordsAtom, annotationsAtom, schemaInputAtom, outputJsonAtom, isAnnotationSubmittedAtom } from "../state/atom"
import { parseSeparateInputs } from "../logic/parser"
import { transformToRecords } from "../logic/transformer"
import type { AnnotationState } from "../types/annotation"

interface Extraction {
  id: string
  title: string
  createdAt: string
  submittedAt: string
  annotations: Array<{
    id: string
    recordId: string
    fieldName: string
    status: string
    extractedValue?: string
    expectedValue?: string
    category?: string
    confidence?: number
  }>
}

export default function History() {
  const [extractions, setExtractions] = useState<Extraction[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const setRecords = useSetRecoilState(recordsAtom)
  const setAnnotations = useSetRecoilState(annotationsAtom)
  const setSchemaInput = useSetRecoilState(schemaInputAtom)
  const setOutputJson = useSetRecoilState(outputJsonAtom)
  const setIsSubmitted = useSetRecoilState(isAnnotationSubmittedAtom)

  useEffect(() => {
    loadExtractions()
  }, [])

  const loadExtractions = async () => {
    setLoading(true)
    try {
      const response = await api.getExtractions(50, 0)
      if (response.data) {
        // Filter only submitted extractions
        const submitted = response.data.extractions.filter((e: any) => e.submittedAt)
        setExtractions(submitted)
      }
    } catch (error) {
      console.error('Failed to load extractions:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewExtraction = async (extraction: Extraction) => {
    try {
      const response = await api.getExtraction(extraction.id)
      if (response.data) {
        const ext = response.data.extraction

        // Set schema and output
        setSchemaInput(ext.schemaInput)
        setOutputJson(ext.outputJson)

        // Parse and transform records
        const { schemas, responses } = parseSeparateInputs(ext.schemaInput, ext.outputJson)
        const records = transformToRecords(schemas, responses)
        setRecords(records)

        // Reconstruct annotations from backend data
        const annotationsState: AnnotationState = {}
        ext.annotations.forEach((ann: any) => {
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
        setAnnotations(annotationsState)
        setIsSubmitted(true)

        // Navigate to dashboard
        navigate('/')
      }
    } catch (error) {
      console.error('Failed to load extraction:', error)
    }
  }

  const downloadReport = async (extraction: Extraction) => {
    try {
      const response = await api.getExtraction(extraction.id)
      if (response.data) {
        const ext = response.data.extraction

        // Create report data
        const report = {
          title: ext.title,
          submittedAt: new Date(ext.submittedAt).toLocaleString(),
          annotations: ext.annotations.map((ann: any) => ({
            recordId: ann.recordId,
            fieldName: ann.fieldName,
            status: ann.status,
            extractedValue: ann.extractedValue,
            expectedValue: ann.expectedValue,
            category: ann.category,
            confidence: ann.confidence
          }))
        }

        // Download as JSON
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${extraction.title.replace(/[^a-z0-9]/gi, '_')}_report.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  const getAnnotationStats = (annotations: Extraction['annotations']) => {
    const correct = annotations.filter(a => a.status === 'correct').length
    const incorrect = annotations.filter(a => a.status === 'incorrect').length
    return { correct, incorrect, total: annotations.length }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <Sidebar />

      <main className="transition-all duration-300 pt-20 pl-80">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Annotation History</h1>
            <p className="text-slate-400">View and download your submitted extractions</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
          ) : extractions.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No submitted extractions yet</h3>
              <p className="text-slate-500">Submit your first extraction to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {extractions.map((extraction) => {
                const stats = getAnnotationStats(extraction.annotations)
                return (
                  <div
                    key={extraction.id}
                    className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{extraction.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Submitted {new Date(extraction.submittedAt).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400">{stats.correct} correct</span>
                            <span className="text-red-400">{stats.incorrect} incorrect</span>
                            <span className="text-slate-400">{stats.total} total</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => viewExtraction(extraction)}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadReport(extraction)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
