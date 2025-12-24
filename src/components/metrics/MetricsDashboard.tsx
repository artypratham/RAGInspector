import { Brain, Target, CheckCircle, Edit3, AlertTriangle } from "lucide-react"
import type { Metrics } from "../../types/metrics"

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  gradient: string
  textColor?: string
  subtitle?: string
}

function MetricCard({ icon: Icon, label, value, gradient, textColor = "text-white", subtitle }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm hover:border-slate-600 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default function MetricsDashboard({
  metrics,
  totalFields,
  annotatedCount
}: {
  metrics: Metrics
  totalFields: number
  annotatedCount: number
}) {
  const accuracyColor = metrics.groundedAccuracy >= 0.7 ? "text-emerald-400" : "text-amber-400"
  const precisionColor = metrics.retrievalPrecision >= 0.7 ? "text-cyan-400" : "text-amber-400"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={Brain}
        label="Grounded Accuracy"
        value={`${(metrics.groundedAccuracy * 100).toFixed(1)}%`}
        gradient="from-purple-500 to-pink-600"
        textColor={accuracyColor}
        subtitle="Faithfulness to context"
      />

      <MetricCard
        icon={Target}
        label="Retrieval Precision"
        value={`${(metrics.retrievalPrecision * 100).toFixed(1)}%`}
        gradient="from-cyan-500 to-blue-600"
        textColor={precisionColor}
        subtitle="Context relevance"
      />

      <MetricCard
        icon={CheckCircle}
        label="Annotated Fields"
        value={`${annotatedCount}/${totalFields}`}
        gradient="from-emerald-500 to-teal-600"
        textColor="text-emerald-400"
        subtitle={`${((annotatedCount / Math.max(totalFields, 1)) * 100).toFixed(0)}% complete`}
      />

      <MetricCard
        icon={Edit3}
        label="Correct Fields"
        value={metrics.correctFields}
        gradient="from-green-500 to-emerald-600"
        textColor="text-green-400"
        subtitle={`${metrics.incorrectFields} incorrect`}
      />

      <MetricCard
        icon={AlertTriangle}
        label="Hallucination Rate"
        value={`${(metrics.hallucinationRate * 100).toFixed(1)}%`}
        gradient="from-orange-500 to-red-600"
        textColor={metrics.hallucinationRate > 0.3 ? "text-red-400" : "text-orange-400"}
        subtitle="Ungrounded responses"
      />

      <MetricCard
        icon={Target}
        label="Retrieval Recall"
        value={`${(metrics.retrievalRecall * 100).toFixed(1)}%`}
        gradient="from-blue-500 to-indigo-600"
        textColor="text-blue-400"
        subtitle="Coverage completeness"
      />

      <MetricCard
        icon={Brain}
        label="Confidence Calibration"
        value={metrics.confidenceCalibrationError.toFixed(3)}
        gradient="from-slate-600 to-slate-700"
        textColor="text-slate-300"
        subtitle="Lower is better"
      />

      <MetricCard
        icon={CheckCircle}
        label="Total Records"
        value={totalFields}
        gradient="from-indigo-500 to-purple-600"
        textColor="text-indigo-400"
        subtitle="Fields extracted"
      />
    </div>
  )
}
