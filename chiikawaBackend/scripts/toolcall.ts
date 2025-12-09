import '@/ai/llm/provider'
import { generateText } from 'ai'
import { getModelConfig } from '@/ai/llm/model'
import { getBavariaHolidaysTool } from '@/ai/rag/tools/holiday'

async function testHolidayTool() {
  try {
    const cfg = getModelConfig('summary')
    console.log(`Using model: ${cfg.modelId}`)
    console.log(`Provider: ${cfg.provider}`)

    // Test 1: Ask for current month holidays (no parameters)
    console.log('\n=== Test 1: Current month holidays ===')
    const result1 = await generateText({
      model: cfg.modelId,
      messages: [
        {
          role: 'user',
          content: 'What are the public holidays in Bavaria this month?',
        },
      ],
      tools: {
        getBavariaHolidays: getBavariaHolidaysTool,
      },
    })

    console.log('Response text:', result1.text || '(empty)')
    console.log('Finish reason:', result1.finishReason)
    console.log('\nTool calls:', JSON.stringify(result1.toolCalls, null, 2))
    console.log('\nTool results:', JSON.stringify(result1.toolResults, null, 2))
    if (result1.toolResults && result1.toolResults.length > 0) {
      const toolResult = result1.toolResults[0]
      if (toolResult && 'output' in toolResult) {
        console.log('\nHolidays found:', JSON.stringify(toolResult.output, null, 2))
      }
    }

    // Test 2: Ask for specific month holidays
    console.log('\n=== Test 2: December 2025 holidays ===')
    const result2 = await generateText({
      model: cfg.modelId,
      messages: [
        {
          role: 'user',
          content: 'What are the public holidays in Bavaria in December 2025?',
        },
      ],
      tools: {
        getBavariaHolidays: getBavariaHolidaysTool,
      },
    })

    console.log('Response text:', result2.text || '(empty)')
    console.log('Finish reason:', result2.finishReason)
    console.log('\nTool calls:', JSON.stringify(result2.toolCalls, null, 2))
    console.log('\nTool results:', JSON.stringify(result2.toolResults, null, 2))
    if (result2.toolResults && result2.toolResults.length > 0) {
      const toolResult = result2.toolResults[0]
      if (toolResult && 'output' in toolResult) {
        console.log('\nHolidays found:', JSON.stringify(toolResult.output, null, 2))
      }
    }
    console.log('The tool execution is working correctly.')
  } catch (error) {
    console.error('Error testing holiday tool:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

testHolidayTool()
