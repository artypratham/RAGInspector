import { useRecoilValue } from "recoil"
import { recordsAtom, annotationsAtom } from "../../state/atom"
import { AlertCircle, TrendingUp, Database, FileText, XCircle } from "lucide-react"
import { useMemo } from "react"

interface ErrorCategory {
  name: string
  count: number
  percentage: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  examples: string[]
}

export default function ErrorAnalysis() {
  const records = useRecoilValue(recordsAtom)
  const annotations = useRecoilValue(annotationsAtom)

  const errorBreakdown = useMemo(() => {
    const categories: Record<string, { count: number; examples: string[] }> = {
      hallucination: { count: 0, examples: [] },
      retrieval: { count: 0, examples: [] },
      extraction: { count: 0, examples: [] },
      formatting: { count: 0, examples: [] },
      other: { count: 0, examples: [] }
    }

    let totalErrors = 0

    records.forEach(record => {
      const recordAnnotations = annotations[record.record_id] || {}
      Object.entries(recordAnnotations).forEach(([field, annotation]) => {
        if (annotation.status === "incorrect") {
          totalErrors++
          const category = annotation.category || "other"
          if (categories[category]) {
            categories[category].count++
            if (categories[category].examples.length < 3) {
              categories[category].examples.push(`${record.doc_id}: ${field}`)
            }
          } else {
            categories.other.count++
            if (categories.other.examples.length < 3) {
              categories.other.examples.push(`${record.doc_id}: ${field}`)
            }
          }
        }
      })
    })

    const errorCategories: ErrorCategory[] = [
      {
        name: "Hallucination",
        count: categories.hallucination.count,
        percentage: (categories.hallucination.count / Math.max(totalErrors, 1)) * 100,
        icon: AlertCircle,
        color: "from-red-500 to-rose-600",
        examples: categories.hallucination.examples
      },
      {
        name: "Retrieval Failure",
        count: categories.retrieval.count,
        percentage: (categories.retrieval.count / Math.max(totalErrors, 1)) * 100,
        icon: Database,
        color: "from-orange-500 to-amber-600",
        examples: categories.retrieval.examples
      },
      {
        name: "Extraction Error",
        count: categories.extraction.count,
        percentage: (categories.extraction.count / Math.max(totalErrors, 1)) * 100,
        icon: FileText,
        color: "from-yellow-500 to-orange-500",
        examples: categories.extraction.examples
      },
      {
        name: "Formatting Issue",
        count: categories.formatting.count,
        percentage: (categories.formatting.count / Math.max(totalErrors, 1)) * 100,
        icon: TrendingUp,
        color: "from-blue-500 to-cyan-600",
        examples: categories.formatting.examples
      },
      {
        name: "Other",
        count: categories.other.count,
        percentage: (categories.other.count / Math.max(totalErrors, 1)) * 100,
        icon: XCircle,
        color: "from-slate-500 to-slate-600",
        examples: categories.other.examples
      }
    ]

    return { categories: errorCategories, totalErrors }
  }, [records, annotations])

  if (errorBreakdown.totalErrors === 0) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Errors Found</h3>
        <p className="text-slate-400">
          Start annotating fields to identify and categorize errors in your RAG pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Error Analysis</h2>
            <p className="text-slate-400 mt-1">
              Total errors identified: <span className="text-red-400 font-semibold">{errorBreakdown.totalErrors}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {errorBreakdown.categories
            .filter(cat => cat.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(category => {
              const Icon = category.icon
              return (
                <div
                  key={category.name}
                  className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-slate-600 transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{category.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white">{category.count}</span>
                          <span className="text-sm text-slate-400">
                            ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>

                    {category.examples.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Examples
                        </p>
                        <div className="space-y-1">
                          {category.examples.map((example, i) => (
                            <div
                              key={i}
                              className="text-xs text-slate-300 bg-slate-900/50 rounded px-3 py-2 font-mono"
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6">
        <h3 className="text-lg font-bold text-white mb-4">Error Distribution</h3>
        <div className="space-y-3">
          {errorBreakdown.categories
            .filter(cat => cat.count > 0)
            .sort((a, b) => b.count - a.count)
            .map(category => (
              <div key={category.name} className="flex items-center gap-3">
                <div className="w-32 text-sm text-slate-400">{category.name}</div>
                <div className="flex-1 bg-slate-800 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${category.color} flex items-center justify-end px-3 transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {category.count > 0 && category.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-white">
                  {category.count}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
