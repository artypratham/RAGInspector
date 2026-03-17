import { useMemo, useState, useRef } from "react"
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { recordsAtom, sidebarOpenAtom, annotationsAtom, schemaInputAtom, outputJsonAtom, isAnnotationSubmittedAtom, extractionsAtom } from "../state/atom"
import { metricsSelector } from "../state/selector"
import Header from "../components/common/Header"
import Sidebar from "../components/common/Sidebar"
import UploadPanel from "../components/common/UploadPanel"
import RecordList from "../components/records/RecordList"
import MetricsDashboard from "../components/metrics/MetricsDashboard"
import ErrorAnalysis from "../components/analysis/ErrorAnalysis"
import { Save, CheckCircle, Loader2, Download, Plus, FileText } from "lucide-react"
import { api } from "../services/api"
import { generatePDFReport } from "../utils/pdfReport"

export default function Dashboard() {
  const records = useRecoilValue(recordsAtom)
  const sidebarOpen = useRecoilValue(sidebarOpenAtom)
  const metrics = useRecoilValue(metricsSelector)
  const [annotations, setAnnotations] = useRecoilState(annotationsAtom)
  const schemaInput = useRecoilValue(schemaInputAtom)
  const outputJson = useRecoilValue(outputJsonAtom)
  const [isAnnotationSubmitted, setIsAnnotationSubmitted] = useRecoilState(isAnnotationSubmittedAtom)
  const setRecords = useSetRecoilState(recordsAtom)
  const setSchemaInput = useSetRecoilState(schemaInputAtom)
  const setOutputJson = useSetRecoilState(outputJsonAtom)
  const setExtractions = useSetRecoilState(extractionsAtom)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const submittingRef = useRef(false)

  const totalFields = useMemo(() => {
    return records.reduce((sum, r) => sum + Object.keys(r.input_schema).length, 0)
  }, [records])

  const annotatedCount = useMemo(() => {
    let count = 0
    records.forEach(r => {
      Object.keys(r.input_schema).forEach(field => {
        if (annotations[r.record_id]?.[field]?.status) count++
      })
    })
    return count
  }, [records, annotations])

  const handleSubmitAnnotations = async () => {
    if (isAnnotationSubmitted || submittingRef.current) return
    submittingRef.current = true
    setIsSubmitting(true)
    try {
      // Convert annotations to API format
      const annotationsArray = []
      for (const recordId in annotations) {
        for (const fieldName in annotations[recordId]) {
          const annotation = annotations[recordId][fieldName]
          annotationsArray.push({
            recordId,
            fieldName,
            status: annotation.status,
            extractedValue: annotation.extracted_value,
            expectedValue: annotation.expected_value,
            category: annotation.category,
            confidence: annotation.confidence
          })
        }
      }

      const response = await api.submitExtraction({
        title: `Extraction - ${new Date().toLocaleString()}`,
        schemaInput,
        outputJson,
        annotations: annotationsArray
      })

      if (response.data) {
        setIsAnnotationSubmitted(true)
        setSubmitSuccess(true)
        setTimeout(() => setSubmitSuccess(false), 3000)

        // Refresh sidebar to show newly submitted extraction
        const extractionsResponse = await api.getExtractions(50, 0)
        if (extractionsResponse.data) {
          const submittedExtractions = extractionsResponse.data.extractions.filter(
            (ext: any) => ext.submittedAt !== null && ext.submittedAt !== undefined
          )
          setExtractions(submittedExtractions)
        }
      }
    } catch (error) {
      // Submission failed — allow retry
    } finally {
      setIsSubmitting(false)
      submittingRef.current = false
    }
  }

  const handleDownloadPDFReport = () => {
    generatePDFReport(records, metrics, annotations, totalFields, annotatedCount)
  }

  const handleDownloadJSONReport = () => {
    // Create report data
    const report = {
      title: `Extraction - ${new Date().toLocaleString()}`,
      submittedAt: new Date().toLocaleString(),
      records: records.map(r => ({
        record_id: r.record_id,
        doc_id: r.doc_id,
        success: r.success
      })),
      annotations: Object.entries(annotations).flatMap(([recordId, fields]) =>
        Object.entries(fields).map(([fieldName, annotation]) => ({
          recordId,
          fieldName,
          status: annotation.status,
          extractedValue: annotation.extracted_value,
          expectedValue: annotation.expected_value,
          category: annotation.category,
          confidence: annotation.confidence
        }))
      ),
      summary: {
        totalFields,
        annotatedCount,
        correctCount: Object.values(annotations).flatMap(fields => Object.values(fields)).filter(a => a.status === 'correct').length,
        incorrectCount: Object.values(annotations).flatMap(fields => Object.values(fields)).filter(a => a.status === 'incorrect').length
      }
    }

    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extraction_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleNewAnalysis = () => {
    setRecords([])
    setAnnotations({})
    setSchemaInput("")
    setOutputJson("")
    setIsAnnotationSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <Sidebar />

      <main className={`transition-all duration-300 pt-20 ${sidebarOpen ? 'pl-80' : 'pl-0'}`}>
        <div className="p-8">
          {records.length === 0 ? (
            <UploadPanel />
          ) : (
            <div className="space-y-8">
              <MetricsDashboard metrics={metrics} totalFields={totalFields} annotatedCount={annotatedCount} />

              {/* Submit Annotations Button */}
              {annotatedCount > 0 && !isAnnotationSubmitted && (
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmitAnnotations}
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Annotations...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Submit All Annotations ({annotatedCount} fields)
                      </>
                    )}
                  </button>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center justify-center gap-2 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Annotations submitted successfully!</span>
                </div>
              )}

              {isAnnotationSubmitted && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">This extraction has been submitted and is now read-only</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 flex-wrap">
                    <button
                      onClick={handleDownloadPDFReport}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-red-500/30"
                    >
                      <FileText className="w-5 h-5" />
                      Download PDF Report
                    </button>
                    <button
                      onClick={handleDownloadJSONReport}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-emerald-500/30"
                    >
                      <Download className="w-5 h-5" />
                      Download JSON
                    </button>
                    <button
                      onClick={handleNewAnalysis}
                      className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
                    >
                      <Plus className="w-5 h-5" />
                      New Analysis
                    </button>
                  </div>
                </div>
              )}

              <ErrorAnalysis />
              <RecordList />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
