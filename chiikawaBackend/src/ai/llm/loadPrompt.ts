// src/ai/prompt-loader.ts
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import YAML from 'yaml'

export type StructuredPrompt = {
  role_desc: string
  constraints?: string[]
  responsibilities?: Record<string, string>
  available_tools?: unknown
  few_shot?: unknown
}

export type LoadedSystemPrompt = {
  systemPrompt: string
  hash: string
  raw: StructuredPrompt
}

const promptCache = new Map<string, LoadedSystemPrompt>()

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

function buildSystemPrompt(config: StructuredPrompt): string {
  const lines: string[] = []

  // role description
  if (config.role_desc) {
    lines.push(config.role_desc.trim())
  }

  // constraints
  if (config.constraints && config.constraints.length > 0) {
    lines.push('', 'Constraints:')
    for (const c of config.constraints) {
      lines.push(`- ${c.replace(/^\s*-\s*/, '')}`)
    }
  }

  // responsibilities
  if (config.responsibilities && Object.keys(config.responsibilities).length > 0) {
    lines.push('', 'Responsibilities:')
    for (const [key, value] of Object.entries(config.responsibilities)) {
      lines.push(`- ${key}:`)
      lines.push(value.trim())
    }
  }

  if (config.available_tools !== undefined) {
    lines.push('', 'Available tools:')
    const toolsBlock = YAML.stringify(config.available_tools).trim()
    if (toolsBlock) {
      lines.push(toolsBlock)
    }
  }

  if (config.few_shot !== undefined) {
    lines.push('', 'Behavior examples (few-shot):')
    const fewShotBlock = YAML.stringify(config.few_shot).trim()
    if (fewShotBlock) {
      lines.push(fewShotBlock)
    }
  }

  return lines.join('\n')
}

export async function loadSystemPrompt(path: string): Promise<LoadedSystemPrompt> {
  const fileContent = await fs.readFile(path, 'utf8')
  const currentHash = hashContent(fileContent)

  // if hash is not changed, use cached
  const cached = promptCache.get(path)
  if (cached && cached.hash === currentHash) {
    return cached
  }

  // parse YAML
  const parsed = YAML.parse(fileContent) as StructuredPrompt

  // build system prompt string
  const systemPrompt = buildSystemPrompt(parsed)

  // assemble result and write to cache
  const loaded: LoadedSystemPrompt = {
    systemPrompt,
    hash: currentHash,
    raw: parsed,
  }

  promptCache.set(path, loaded)
  return loaded
}
