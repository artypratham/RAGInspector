import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil"
import {
  userAtom,
  isAuthenticatedAtom,
  sidebarOpenAtom,
  recordsAtom,
  schemaInputAtom,
  outputJsonAtom,
  currentExtractionIdAtom,
  extractionsAtom,
  annotationsAtom,
} from "../../state/atom"
import { metricsSelector } from "../../state/selector"
import { api } from "../../services/api"
import { Activity, User, LogOut, Menu, Plus, Download } from "lucide-react"
import { generatePDFReport } from "../../utils/pdfReport"

export default function Header() {
  const navigate = useNavigate()
  const user = useRecoilValue(userAtom)
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom)
  const setUser = useSetRecoilState(userAtom)
  const setSidebarOpen = useSetRecoilState(sidebarOpenAtom)
  const [records, setRecords] = useRecoilState(recordsAtom)
  const [schemaInput, setSchemaInput] = useRecoilState(schemaInputAtom)
  const [outputJson, setOutputJson] = useRecoilState(outputJsonAtom)
  const setCurrentExtractionId = useSetRecoilState(currentExtractionIdAtom)
  const setExtractions = useSetRecoilState(extractionsAtom)
  const annotations = useRecoilValue(annotationsAtom)
  const metrics = useRecoilValue(metricsSelector)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [savingNewAnalysis, setSavingNewAnalysis] = useState(false)

  // Calculate total fields and annotated count
  const totalFields = records.reduce((sum, r) => sum + Object.keys(r.input_schema).length, 0)
  const annotatedCount = Object.values(annotations).reduce((sum, recordAnnotations) => {
    return sum + Object.values(recordAnnotations).filter(a => a.status).length
  }, 0)

  const hasAnalysis = records.length > 0
  const isFullyAnnotated = hasAnalysis && annotatedCount === totalFields && totalFields > 0

  const submitIncorrectAnnotation = Object.values(annotations).some(recordAnnotations =>
    Object.values(recordAnnotations).some(annotation => !annotation.status)
  )

  // Debug logging
  console.log('Export Report Debug:', {
    totalFields,
    annotatedCount,
    hasAnalysis,
    isFullyAnnotated,
    annotations
  })

  function handleLogout() {
    api.logout()
    setUser(null)
    setIsAuthenticated(false)
    navigate("/login")
  }

  async function handleNewAnalysis() {
    // Save current analysis if it exists
    if (schemaInput.trim() && outputJson.trim() && !savingNewAnalysis) {
      setSavingNewAnalysis(true)
      try {
        const title = `Analysis ${new Date().toLocaleString()}`
        await api.createExtraction({
          title,
          schemaInput,
          outputJson,
        })

        // Refresh extractions list
        const response = await api.getExtractions(50, 0)
        if (response.data) {
          setExtractions(response.data.extractions)
        }
      } catch (error) {
        console.error("Error saving analysis:", error)
      } finally {
        setSavingNewAnalysis(false)
      }
    }

    // Clear current state for new analysis
    setSchemaInput("")
    setOutputJson("")
    setRecords([])
    setCurrentExtractionId(null)
  }

  function handleExportReport() {
    try {
      console.log('Starting PDF export...', { records, metrics, annotations, totalFields, annotatedCount })
      generatePDFReport(records, metrics, annotations, totalFields, annotatedCount)
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('Error generating PDF report:', error)
      alert('Failed to generate PDF report. Please check the console for details.')
    }
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center w-10"/>
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">RAG Inspector</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New Analysis Button */}
          {/* {hasAnalysis && (
            <button
              onClick={handleNewAnalysis}
              disabled={savingNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {savingNewAnalysis ? "Saving..." : "New Analysis"}
              </span>
            </button>
          )} */}

          {/* Export Report Button */}
          {isFullyAnnotated && submitIncorrectAnnotation &&  (
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-medium transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          )}





          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
