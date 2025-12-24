import type { RecordData } from "../types/pipeline"

export function transformToRecords(pairs: any[]): RecordData[] {
  return pairs.map((pair, idx) => {
    const schemaProps = pair.schema.properties
    const extracted = pair.response.extraction || {}
    const provenance = pair.response.provenance || {}

    const extracted_fields: any = {}
    const retrieved_context: any[] = []

    Object.keys(schemaProps).forEach(field => {
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

    return {
      record_id: pair.response.doc_id || `rec_${idx}`,
      doc_id: pair.response.doc_id,
      success: pair.response.success,
      input_schema: schemaProps,
      extracted_fields,
      retrieved_context,
      metadata: pair.response.metadata
    }
  })
}
