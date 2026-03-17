import type { RecordData } from "../types/pipeline"

export function transformToRecords(pairs: any[]): RecordData[] {
  return pairs.map((pair, idx) => {
    const schemaProps = pair.schema?.properties || {}
    const extracted = pair.response.extraction || {}
    const provenance = pair.response.provenance || {}

    const extracted_fields: any = {}
    const retrieved_context: any[] = []

    // Use extraction keys as the source of truth, falling back to schema keys
    const allFields = new Set([...Object.keys(extracted), ...Object.keys(schemaProps)])

    allFields.forEach(field => {
      extracted_fields[field] = {
        value: extracted[field] ?? null,
        confidence: provenance[field]?.confidence ?? 0,
        requires_review: provenance[field]?.requires_review ?? false
      }

      if (provenance[field]?.source) {
        retrieved_context.push({
          field_name: field,
          text: provenance[field].source.source_text,
          page_number: provenance[field].source.page_number,
          section_id: provenance[field].source.section_id,
          char_range:
            provenance[field].source.char_start &&
            provenance[field].source.char_end
              ? `${provenance[field].source.char_start}-${provenance[field].source.char_end}`
              : undefined
        })
      }
    })

    // Ensure input_schema covers all fields (not just schema-provided ones)
    const mergedSchema: Record<string, any> = { ...schemaProps }
    allFields.forEach(field => {
      if (!mergedSchema[field]) {
        mergedSchema[field] = { type: "string", description: field }
      }
    })

    return {
      record_id: pair.response.doc_id || `rec_${idx}`,
      doc_id: pair.response.doc_id,
      success: pair.response.success,
      input_schema: mergedSchema,
      extracted_fields,
      retrieved_context,
      metadata: pair.response.metadata
    }
  })
}
