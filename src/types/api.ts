export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

export interface BackendAnnotation {
  id: string
  recordId: string
  fieldName: string
  status: string
  extractedValue?: string
  expectedValue?: string
  category?: string
  confidence?: number
}

export interface Extraction {
  id: string
  title: string
  schemaInput: string
  outputJson: string
  createdAt: string
  submittedAt: string | null
  annotations: BackendAnnotation[]
}

export interface ExtractionListItem {
  id: string
  title: string
  createdAt: string
  submittedAt: string | null
  annotations: BackendAnnotation[]
}

export interface Pagination {
  total: number
  limit: number
  offset: number
}
