function sanitizeJsonText(text: string): string {
  let result = ""
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const code = text.charCodeAt(i)

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === "\\") {
      result += char
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      result += char
      continue
    }

    // Smart double quotes used as JSON string delimiters (outside strings)
    if (!inString && (code === 0x201c || code === 0x201d)) {
      inString = !inString
      result += '"'
      continue
    }

    // Smart quotes inside strings are valid Unicode — keep them as-is
    result += char
  }

  return result
}

function removeTrailingCommas(text: string): string {
  let result = ""
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === "\\") {
      result += char
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      result += char
      continue
    }

    if (!inString && char === ",") {
      let j = i + 1
      while (j < text.length && /\s/.test(text[j])) j++
      if (j < text.length && (text[j] === "}" || text[j] === "]")) {
        continue
      }
    }

    result += char
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseJsonBlocks(text: string): Record<string, any>[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonBlocks: Record<string, any>[] = []
  let braceCount = 0
  let current = ""
  let inBlock = false
  let inString = false
  let escaped = false
  const errors: string[] = []

  text = sanitizeJsonText(text)
  text = removeTrailingCommas(text)

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inBlock) {
      if (escaped) {
        escaped = false
        current += char
        continue
      }
      if (char === "\\") {
        escaped = true
        current += char
        continue
      }
      if (char === '"') {
        inString = !inString
        current += char
        continue
      }
    }

    if (!inString) {
      if (char === "{") {
        if (braceCount === 0) inBlock = true
        braceCount++
      }

      if (char === "}") {
        if (inBlock) current += char
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
          inString = false
          escaped = false
        }
        continue
      }
    }

    if (inBlock) current += char
  }

  if (jsonBlocks.length === 0) {
    throw new Error(`No valid JSON blocks found. Parse errors: ${errors.join(', ') || 'None'}`)
  }

  return jsonBlocks
}

interface SchemaPair {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: Record<string, any>
}

export function parsePipelineData(text: string): SchemaPair[] {
  const jsonBlocks = parseJsonBlocks(text)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemas: Record<string, any>[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responses: Record<string, any>[] = []

  jsonBlocks.forEach(b => {
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

export function parseSeparateInputs(schemaText: string, outputText: string): SchemaPair[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let schemaBlocks: Record<string, any>[] = []
  try {
    schemaBlocks = parseJsonBlocks(schemaText)
  } catch {
    // Schema parsing failed — will auto-generate from extraction keys below
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schemas: Record<string, any>[] = []

  schemaBlocks.forEach(b => {
    if (b.schema?.properties || b.schema?.type === 'object') {
      schemas.push(b)
    } else if (b.input_schema) {
      schemas.push({ schema: { properties: b.input_schema } })
    } else {
      schemas.push({ schema: { properties: b } })
    }
  })

  const outputBlocks = parseJsonBlocks(outputText)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responses: Record<string, any>[] = []

  outputBlocks.forEach(b => {
    responses.push(b)
  })

  if (responses.length === 0) {
    throw new Error('No extraction responses found. Expected JSON objects with extraction results.')
  }

  // If no schema was found, auto-generate one from extraction keys
  if (schemas.length === 0) {
    responses.forEach(r => {
      const extraction = r.extraction || r.extracted_fields || {}
      const properties: Record<string, { type: string; description: string }> = {}
      Object.keys(extraction).forEach(key => {
        properties[key] = { type: "string", description: key }
      })
      schemas.push({ schema: { properties } })
    })
  }

  return responses.map((r, i) => ({
    schema: schemas[i]?.schema || schemas[0]?.schema,
    response: r
  }))
}
