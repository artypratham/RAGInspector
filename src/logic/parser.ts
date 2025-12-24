export function parsePipelineData(text: string): any[] {
  const jsonBlocks: any[] = []
  let braceCount = 0
  let current = ""
  let inBlock = false

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
          jsonBlocks.push(JSON.parse(current))
        } catch {}
        current = ""
        inBlock = false
      }
    }
  }

  const schemas: any[] = []
  const responses: any[] = []

  jsonBlocks.forEach(b => {
    if (b.schema?.properties) schemas.push(b)
    else if (b.extraction) responses.push(b)
  })

  return responses.map((r, i) => ({
    schema: schemas[i]?.schema || schemas[0]?.schema,
    response: r
  }))
}
