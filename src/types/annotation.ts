export type AnnotationStatus = "correct" | "incorrect"

export interface FieldAnnotation {
  status: AnnotationStatus
  reason?: string
  category?: string
  expected_value?: string
  extracted_value?: string
  confidence?: number
}

export interface AnnotationState {
  [recordId: string]: {
    [field: string]: FieldAnnotation
  }
}
