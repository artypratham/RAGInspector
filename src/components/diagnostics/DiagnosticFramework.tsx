import { CheckCircle, AlertTriangle, Database, Brain, ChevronRight } from 'lucide-react'

interface DiagnosticFrameworkProps {
  faithfulness: number
  relevance: number
}

export default function DiagnosticFramework({ faithfulness, relevance }: DiagnosticFrameworkProps) {
  const getDiagnosis = () => {
    const highFaith = faithfulness >= 0.7
    const highRel = relevance >= 0.7

    if (highFaith && !highRel) {
      return {
        type: 'retrieval',
        title: 'Retrieval Problem Detected',
        description: 'High faithfulness but low relevance indicates the LLM is generating accurately from context, but the retrieved context is not relevant to the query.',
        recommendations: [
          'Review and improve embedding model quality',
          'Tune chunk size and overlap parameters',
          'Implement better query preprocessing',
          'Add semantic reranking after initial retrieval',
          'Review index structure and metadata filtering'
        ],
        color: 'from-amber-500 to-orange-600',
        icon: Database
      }
    }
    if (!highFaith && highRel) {
      return {
        type: 'generation',
        title: 'Generation Problem Detected',
        description: 'Low faithfulness but high relevance indicates good retrieval, but the LLM is hallucinating or not following the retrieved context.',
        recommendations: [
          'Add explicit grounding instructions to prompts',
          'Implement citation/attribution requirements',
          'Use constrained decoding techniques',
          'Lower temperature for more deterministic outputs',
          'Add fact-checking post-processing step'
        ],
        color: 'from-purple-500 to-pink-600',
        icon: Brain
      }
    }
    if (!highFaith && !highRel) {
      return {
        type: 'pipeline',
        title: 'Pipeline Broken',
        description: 'Both faithfulness and relevance are low. The entire RAG pipeline needs review from retrieval to generation.',
        recommendations: [
          'Audit data ingestion and preprocessing',
          'Verify embedding model compatibility',
          'Check for index corruption or staleness',
          'Review prompt engineering end-to-end',
          'Consider full pipeline rebuild with monitoring'
        ],
        color: 'from-red-500 to-rose-700',
        icon: AlertTriangle
      }
    }
    return {
      type: 'healthy',
      title: 'Pipeline Healthy - Check Edge Cases',
      description: 'Both metrics are high. Focus on edge cases and continuous monitoring for regression.',
      recommendations: [
        'Document current configuration as baseline',
        'Set up alerting for metric degradation',
        'Build evaluation dataset from edge cases',
        'Implement A/B testing for improvements',
        'Monitor latency and cost metrics'
      ],
      color: 'from-emerald-500 to-teal-600',
      icon: CheckCircle
    }
  }

  const diagnosis = getDiagnosis()
  const Icon = diagnosis.icon

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${diagnosis.color} p-[2px]`}>
      <div className="bg-slate-900 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${diagnosis.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{diagnosis.title}</h3>
            <p className="text-slate-300 mb-4">{diagnosis.description}</p>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recommendations</h4>
              <ul className="space-y-1">
                {diagnosis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
