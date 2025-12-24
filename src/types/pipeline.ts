export interface SchemaField{
    type: string
    description: string
}

export interface InputSchema{
    [field: string]: SchemaField
}

export interface ExtractedField{
    value: string | null
    confidence: number
    requires_review: boolean
}

export interface RetrievedContext {
    field_name: string
    text : string
    page_number?: number
    section_id?: string
    char_range?: string
}

export interface RecordData{
    record_id: string
    doc_id: string
    success: boolean
    input_schema: InputSchema
    extracted_fields: Record<string, ExtractedField>
    retrieved_context: RetrievedContext[]
    metadata?: any
}