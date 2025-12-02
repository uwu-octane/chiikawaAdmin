import { createGateway } from '@ai-sdk/gateway'
import config from '@/config/config'

const apiKey = config.vercel.gatewayKey

if (!apiKey) {
  console.warn('[ai-gateway] AI_GATEWAY_API_KEY is not set. Calls to Gateway will fail with 401.')
}

// 创建 Gateway provider 实例
export const gatewayProvider = createGateway({
  apiKey,
})

globalThis.AI_SDK_DEFAULT_PROVIDER = gatewayProvider

console.log(
  '[ai-gateway] default provider initialized. key prefix =',
  apiKey ? apiKey.slice(0, 6) : 'UNSET',
)
