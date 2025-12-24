export interface Metrics {
  totalFields: number
  correctFields: number
  incorrectFields: number

  groundedAccuracy: number
  hallucinationRate: number
  retrievalPrecision: number
  retrievalRecall: number
  confidenceCalibrationError: number
}
