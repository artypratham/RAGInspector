import type { RecordData } from "../types/pipeline"
import type { AnnotationState } from "../types/annotation"
import type { Metrics } from "../types/metrics"

export function computeMetrics(
  records: RecordData[],
  annotations: AnnotationState
): Metrics {

  let totalFields = 0
  let correct = 0
  let incorrect = 0
  let withContext = 0
  let correctWithContext = 0
  let hallucinations = 0
  let calibrationSum = 0
  let calibrationCount = 0

  records.forEach(record => {
    const fields = Object.keys(record.input_schema)
    totalFields += fields.length

    fields.forEach(field => {
      const ann = annotations[record.record_id]?.[field]
      const extracted = record.extracted_fields[field]
      const hasContext = record.retrieved_context.some(
        c => c.field_name === field
      )

      if (hasContext) withContext++

      if (ann?.status === "correct") {
        correct++
        if (hasContext) correctWithContext++
      }

      if (ann?.status === "incorrect") {
        incorrect++
        if (ann.category?.includes("Hallucination")) {
          hallucinations++
        }
      }

      if (extracted?.confidence !== undefined && ann) {
        const correctness = ann.status === "correct" ? 1 : 0
        calibrationSum += Math.abs(extracted.confidence - correctness)
        calibrationCount++
      }
    })
  })

  return {
    totalFields,
    correctFields: correct,
    incorrectFields: incorrect,

    groundedAccuracy: correctWithContext / Math.max(totalFields, 1),
    hallucinationRate: hallucinations / Math.max(totalFields, 1),
    retrievalPrecision: correctWithContext / Math.max(withContext, 1),
    retrievalRecall: withContext / Math.max(totalFields, 1),
    confidenceCalibrationError: calibrationSum / Math.max(calibrationCount, 1)
  }
}
