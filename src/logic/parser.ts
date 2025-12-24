export function parsePipelineData(text: string): any[] {
  const jsonBlocks: any[] = []
  let braceCount = 0
  let current = ""
  let inBlock = false
  const errors: string[] = []

  // Clean up common JSON issues
  text = text.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === "{") {
      if (braceCount === 0) inBlock = true
      braceCount++
    }

    if (inBlock) current += char

    if (char === "}") {
      braceCount--
      if (braceCount === 0 && inBlock) {
        try {
          const parsed = JSON.parse(current)
          jsonBlocks.push(parsed)
        } catch (e) {
          errors.push(`Failed to parse JSON block: ${e instanceof Error ? e.message : 'Unknown error'}`)
        }
        current = ""
        inBlock = false
      }
    }
  }

  if (jsonBlocks.length === 0) {
    throw new Error(`No valid JSON blocks found. Parse errors: ${errors.join(', ') || 'None'}`)
  }

  const schemas: any[] = []
  const responses: any[] = []

  jsonBlocks.forEach(b => {
    // Support both "schema" and "input_schema" formats
    if (b.schema?.properties || b.schema?.type === 'object') {
      schemas.push(b)
    } else if (b.input_schema) {
      schemas.push({ schema: { properties: b.input_schema } })
    } else if (b.extraction || b.success !== undefined) {
      responses.push(b)
    }
  })

  if (schemas.length === 0) {
    throw new Error('No schema found. Expected a JSON object with "schema" or "input_schema" field.')
  }

  if (responses.length === 0) {
    throw new Error('No extraction responses found. Expected JSON objects with "extraction" or "success" fields.')
  }

  return responses.map((r, i) => ({
    schema: schemas[i]?.schema || schemas[0]?.schema,
    response: r
  }))
}
