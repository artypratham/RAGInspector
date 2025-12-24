import { useState, useMemo } from "react"
import { useRecoilValue, useRecoilState } from "recoil"
import { recordsAtom, annotationsAtom } from "../state/atom"
import { metricsSelector } from "../state/selector"
import { Activity, Download, RefreshCw } from "lucide-react"
import UploadPanel from "../components/common/UploadPanel"
import MetricsDashboard from "../components/metrics/MetricsDashboard"
import DiagnosticFramework from "../components/diagnostics/DiagnosticFramework"
import RecordList from "../components/records/RecordList"
import ErrorAnalysis from "../components/analysis/ErrorAnalysis"

export default function App() {
  const records = useRecoilValue(recordsAtom)
  const metrics = useRecoilValue(metricsSelector)
  const [annotations] = useRecoilState(annotationsAtom)
  const [, setRecords] = useRecoilState(recordsAtom)
  const [activeTab, setActiveTab] = useState('annotate')

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

  const exportReport = () => {
    const report = {
      generated_at: new Date().toISOString(),
      metrics: {
        faithfulness_score: metrics.groundedAccuracy,
        contextual_relevance: metrics.retrievalPrecision,
        end_to_end_accuracy: metrics.correctFields / Math.max(totalFields, 1)
      },
      annotations: annotations,
      records: records.map(r => ({
        record_id: r.record_id,
        doc_id: r.doc_id,
        annotations: annotations[r.record_id] || {}
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rag_diagnostic_report_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAnalysis = () => {
    setRecords([])
  }

  if (!records.length) {
    return <UploadPanel />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">RAG Pipeline Diagnostics</h1>
              <p className="text-sm text-slate-400">
                {records.length} records • {totalFields} fields • {annotatedCount} annotated
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetAnalysis}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> New Analysis
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <MetricsDashboard metrics={metrics} totalFields={totalFields} annotatedCount={annotatedCount} />
        </div>

        <div className="mb-8">
          <DiagnosticFramework
            faithfulness={metrics.groundedAccuracy}
            relevance={metrics.retrievalPrecision}
          />
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-slate-700 pb-4">
          <button
            onClick={() => setActiveTab('annotate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'annotate' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Annotate Records
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analysis' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Error Analysis
          </button>
        </div>

        {activeTab === 'annotate' ? (
          <RecordList />
        ) : (
          <ErrorAnalysis />
        )}
      </main>
    </div>
  )
}
