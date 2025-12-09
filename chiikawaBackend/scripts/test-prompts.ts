import '@/ai/llm/provider'
import { generateText } from 'ai'
import { getModelConfig } from '@/ai/llm/model'
import { getPrompt, isPromptAvailable, type PromptRole } from '@/ai/prompt/loadPrompt'

async function testPrompt(role: PromptRole, testMessage: string) {
  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Testing ${role.toUpperCase()} prompt`)
    console.log('='.repeat(60))

    // 检查 prompt 是否可用
    const available = isPromptAvailable(role)
    if (!available) {
      console.log(`❌ ${role} prompt is not available`)
      return
    }

    console.log(`✅ ${role} prompt is available`)

    // 加载 prompt
    const prompt = getPrompt(role)
    if (!prompt) {
      console.log(`❌ Failed to load ${role} prompt`)
      return
    }

    console.log(`\n📝 Prompt loaded (${prompt.length} characters)`)

    // 获取模型配置
    const cfg = getModelConfig('fast-chat')
    console.log(`🤖 Using model: ${cfg.modelId}`)
    console.log(`📦 Provider: ${cfg.provider}\n`)

    // 构建消息
    const messages = [
      {
        role: 'system' as const,
        content: prompt,
      },
      {
        role: 'user' as const,
        content: testMessage,
      },
    ]

    console.log(`💬 Test message: "${testMessage}"\n`)

    // 调用 generateText
    console.log('⏳ Generating response...\n')
    const result = await generateText({
      model: cfg.modelId,
      messages,
      maxOutputTokens: 500,
    })

    // 显示结果
    console.log('✅ Response generated successfully!')
    console.log(`\n📄 Response text:`)
    console.log('-'.repeat(60))
    console.log(result.text)
    console.log('-'.repeat(60))
    console.log(`\n📊 Finish reason: ${result.finishReason}`)
    console.log(`📈 Usage: ${JSON.stringify(result.usage, null, 2)}`)

    return result
  } catch (error) {
    console.error(`\n❌ Error testing ${role} prompt:`, error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    throw error
  }
}

async function testPrompts() {
  try {
    console.log('\n🚀 Starting prompt tests...\n')

    // 测试 system prompt
    await testPrompt('system', 'What are your opening hours?')

    // 等待一下，避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 测试 rewrite prompt
    await testPrompt('rewrite', 'User: What are your opening hours?')

    console.log(`\n${'='.repeat(60)}`)
    console.log('✅ All prompt tests completed!')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Error during prompt tests:', error)
    process.exit(1)
  }
}

testPrompts()
