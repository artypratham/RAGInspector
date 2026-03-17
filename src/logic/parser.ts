function sanitizeJsonText(text: string): string {
  // Replace smart/curly quotes with escaped regular quotes or straight equivalents
  // These often appear in legal documents and break JSON.parse when copy-pasted
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

    if (char === '"' && !escaped) {
      inString = !inString
      result += char
      continue
    }

    if (inString) {
      // Replace smart double quotes with escaped regular quotes
      if (code === 0x201c || code === 0x201d) {
        result += '\\"'
        continue
      }
      // Replace smart single quotes with regular single quotes
      if (code === 0x2018 || code === 0x2019) {
        result += "'"
        continue
      }
    }

    result += char
  }

  return result
}

function removeTrailingCommas(text: string): string {
  // Only remove trailing commas outside of string values
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
      // Look ahead to see if next non-whitespace is } or ]
      let j = i + 1
      while (j < text.length && /\s/.test(text[j])) j++
      if (j < text.length && (text[j] === "}" || text[j] === "]")) {
        // Skip the trailing comma
        continue
      }
    }

    result += char
  }

  return result
}

function parseJsonBlocks(text: string): any[] {
  const jsonBlocks: any[] = []
  let braceCount = 0
  let current = ""
  let inBlock = false
  let inString = false
  let escaped = false
  const errors: string[] = []

  // Sanitize smart quotes and remove trailing commas safely
  text = sanitizeJsonText(text)
  text = removeTrailingCommas(text)

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    // Track string boundaries to ignore braces inside strings
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

export function parsePipelineData(text: string): any[] {
  const jsonBlocks = parseJsonBlocks(text)

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

export function parseSeparateInputs(schemaText: string, outputText: string): any[] {
  // Parse schema (tolerant of empty/missing schema)
  let schemaBlocks: any[] = []
  try {
    schemaBlocks = parseJsonBlocks(schemaText)
  } catch {
    // Schema parsing failed — will auto-generate from extraction keys below
  }
  const schemas: any[] = []

  schemaBlocks.forEach(b => {
    // Support both "schema" and "input_schema" formats
    if (b.schema?.properties || b.schema?.type === 'object') {
      schemas.push(b)
    } else if (b.input_schema) {
      schemas.push({ schema: { properties: b.input_schema } })
    } else {
      // If it's just a plain object with field definitions, treat it as input_schema
      schemas.push({ schema: { properties: b } })
    }
  })

  // Parse output/responses
  const outputBlocks = parseJsonBlocks(outputText)
  const responses: any[] = []

  outputBlocks.forEach(b => {
    if (b.extraction || b.success !== undefined || b.extracted_fields || b.record_id) {
      responses.push(b)
    } else {
      // If it doesn't match known patterns, still include it
      responses.push(b)
    }
  })

  if (responses.length === 0) {
    throw new Error('No extraction responses found. Expected JSON objects with extraction results.')
  }

  // If no schema was found, auto-generate one from extraction keys
  if (schemas.length === 0) {
    responses.forEach(r => {
      const extraction = r.extraction || r.extracted_fields || {}
      const properties: Record<string, any> = {}
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
