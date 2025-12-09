import { readFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import yaml from 'js-yaml'
import { z } from 'zod'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'loadPrompt' })

/**
 * Prompt 职责类型
 */
export type PromptRole = 'system' | 'rewrite'

/**
 * PromptConfig 的 zod schema
 * - 限制 role 只能是 'system' | 'rewrite'
 * - 给出合理默认值
 * - 允许额外字段存在（catchall）
 */
const PromptConfigSchema = z
  .object({
    role: z.enum(['system', 'rewrite']).default('system'),
    system_prompt: z.string().optional(),
    enable_rewrite: z.boolean().optional(),
    rewrite_prompt_system: z.string().optional(),
  })
  // 允许配置里出现其它键，例如 future 扩展字段
  .catchall(z.unknown())

/**
 * Prompt 配置类型（由 schema 推导）
 */
export type PromptConfig = z.infer<typeof PromptConfigSchema>

/**
 * 解析 YAML 文件
 */
function parseYAML(content: string): PromptConfig {
  try {
    const raw = yaml.load(content) ?? {}

    // js-yaml 解析出来可能不是对象，先做一下防御
    if (typeof raw !== 'object' || raw === null) {
      log.error({ raw }, 'YAML root is not an object')
      throw new Error('YAML root must be an object')
    }

    const parsed = PromptConfigSchema.parse(raw)
    return parsed
  } catch (error) {
    log.error({ error }, 'Failed to parse YAML content')

    if (error instanceof z.ZodError) {
      throw new Error(`Prompt config validation failed: ${error.message}`)
    }

    throw new Error(`Failed to parse YAML: ${String(error)}`)
  }
}

/**
 * 计算文件内容的 hash
 */
function calculateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * 缓存已加载的 prompt 配置
 */
let cachedConfig: PromptConfig | null = null
let configFilePath: string | null = null
let cachedContentHash: string | null = null

/**
 * 加载并解析 prompt 配置文件
 */
function loadPromptConfig(filePath?: string): PromptConfig {
  const targetPath = filePath || join(import.meta.dir, 'system.yaml')

  try {
    const content = readFileSync(targetPath, 'utf-8')
    const contentHash = calculateContentHash(content)

    // 如果文件路径和内容 hash 都没变，直接返回缓存
    if (cachedConfig && configFilePath === targetPath && cachedContentHash === contentHash) {
      log.debug({ filePath: targetPath }, 'Using cached prompt config')
      return cachedConfig
    }

    // 内容已变化或首次加载，重新解析
    const config = parseYAML(content)
    cachedConfig = config
    configFilePath = targetPath
    cachedContentHash = contentHash

    log.debug(
      { filePath: targetPath, contentHash: contentHash.substring(0, 8) },
      'Prompt config loaded',
    )

    return config
  } catch (error) {
    log.error({ error, filePath: targetPath }, 'Failed to load prompt config')
    throw new Error(`Failed to load prompt config from ${targetPath}: ${error}`)
  }
}

/**
 * 替换 prompt 中的变量占位符
 * 支持 {{variable}} 和 {variable} 两种格式
 */
function replaceVariables(prompt: string, variables: Record<string, string>): string {
  let result = prompt
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}|\\{${key}\\}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}

/**
 * 获取指定职责的 prompt
 * @param role - Prompt 职责类型 ('system' | 'rewrite')
 * @param filePath - 可选的配置文件路径，默认使用 system.yaml
 * @param customVariables - 可选的动态变量，用于替换 prompt 中的占位符
 */
export function getPrompt(
  role: PromptRole = 'system',
  filePath?: string,
  customVariables?: Record<string, string>,
): string {
  const config = loadPromptConfig(filePath)
  let prompt = ''

  switch (role) {
    case 'system':
      prompt = config.system_prompt || ''
      break
    case 'rewrite':
      if (!config.enable_rewrite) {
        log.warn('Rewrite prompt is disabled in config')
        return ''
      }
      prompt = config.rewrite_prompt_system || ''
      break
    default:
      // 理论上不会进入这里，因为 PromptRole 已经限制了枚举
      throw new Error(`Unknown prompt role: ${role satisfies never}`)
  }

  if (!prompt) {
    // 给一点 log，方便发现配置缺失
    log.warn({ role }, 'Empty prompt string for given role')
  }

  // 如果提供了自定义变量，进行替换
  if (customVariables && Object.keys(customVariables).length > 0) {
    prompt = replaceVariables(prompt, customVariables)
  }

  return prompt.trim()
}

/**
 * 获取完整的 prompt 配置对象
 * @param filePath - 可选的配置文件路径
 */
export function getPromptConfig(filePath?: string): PromptConfig {
  return loadPromptConfig(filePath)
}

/**
 * 清除缓存的 prompt 配置（用于重新加载）
 */
export function clearPromptCache(): void {
  cachedConfig = null
  configFilePath = null
  cachedContentHash = null
  log.debug('Prompt cache cleared')
}

/**
 * 检查指定职责的 prompt 是否可用
 * @param role - Prompt 职责类型
 * @param filePath - 可选的配置文件路径
 */
export function isPromptAvailable(role: PromptRole, filePath?: string): boolean {
  try {
    const config = loadPromptConfig(filePath)
    switch (role) {
      case 'system':
        return !!config.system_prompt
      case 'rewrite':
        return config.enable_rewrite === true && !!config.rewrite_prompt_system
      default:
        return false
    }
  } catch {
    return false
  }
}
