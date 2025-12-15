import { join } from 'path'
import { loadSync, type Root } from 'protobufjs'
import type { ConversationMessage } from '../../schema/conversation/message'
import type { ConversationSession } from '../../schema/conversation/session'

// 加载 proto 文件
const protoPath = join(process.cwd(), 'proto', 'conversation.proto')
const root: Root = loadSync(protoPath)
const ConversationMessageType = root.lookupType('conversation.ConversationMessage')
const ConversationSessionType = root.lookupType('conversation.ConversationSession')

/**
 * 将 ISO string 或 Date 转换为 Unix 时间戳（毫秒）
 */
function toTimestamp(dateOrString: string | Date): number {
  if (typeof dateOrString === 'string') {
    return new Date(dateOrString).getTime()
  }
  return dateOrString.getTime()
}

/**
 * 将 Unix 时间戳（毫秒）转换为 ISO string
 */
function fromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

/**
 * 将 TypeScript 对象转换为 protobuf 格式的 metadata
 */
function metadataToProto(metadata?: Record<string, unknown>): Record<string, string> {
  if (!metadata) return {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(metadata)) {
    result[key] = typeof value === 'string' ? value : JSON.stringify(value)
  }
  return result
}

/**
 * 将 protobuf 格式的 metadata 转换回 TypeScript 对象
 */
function metadataFromProto(proto: Record<string, string> | undefined): Record<string, unknown> {
  if (!proto) return {}
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(proto)) {
    try {
      result[key] = JSON.parse(value)
    } catch {
      result[key] = value
    }
  }
  return result
}

/**
 * 将 ConversationMessage 序列化为 protobuf Buffer
 */
export function serializeMessage(message: ConversationMessage): Buffer {
  const payload = {
    // 注意：protobufjs 会自动把 camelCase 映射到 proto 的 snake_case
    id: message.id,
    sessionId: message.sessionId,
    index: message.msgIndex,
    uiMessageJson: JSON.stringify(message.message),
    createdAt: toTimestamp(message.createdAt),
    updatedAt: toTimestamp(message.updatedAt),
    //metadata
  }

  const errMsg = ConversationMessageType.verify(payload)
  if (errMsg) {
    throw new Error(`Message verification failed: ${errMsg}`)
  }

  const messageProto = ConversationMessageType.create(payload)
  return Buffer.from(ConversationMessageType.encode(messageProto).finish())
}

/**
 * 将 protobuf Buffer 反序列化为 ConversationMessage
 */
export function deserializeMessage(buffer: Buffer): ConversationMessage {
  const messageProto = ConversationMessageType.decode(buffer)
  const obj = ConversationMessageType.toObject(messageProto, {
    longs: Number,
    enums: Number,
    bytes: String,
    defaults: true,
    arrays: true,
    objects: true,
    oneofs: true,
  })

  return {
    id: obj.id as string,
    sessionId: obj.sessionId as string,
    msgIndex: obj.index as number,
    message: JSON.parse(obj.uiMessageJson as string),
    createdAt: fromTimestamp(obj.createdAt as number),
    updatedAt: fromTimestamp(obj.updatedAt as number),
  }
}

/**
 * 将 ConversationSession 序列化为 protobuf Buffer
 */
export function serializeSession(session: ConversationSession): Buffer {
  const payload = {
    sessionId: session.sessionId,
    userId: session.userId ?? undefined,
    tenantId: session.tenantId ?? undefined,
    channel: session.channel === 'web-chat' ? 1 : session.channel === 'voice' ? 2 : 3,
    title: session.title ?? undefined,
    deleted: session.deleted ?? false,
    startedAt: toTimestamp(session.startedAt),
    lastMessageAt: toTimestamp(session.lastMessageAt),
    createdAt: toTimestamp(session.createdAt),
    updatedAt: toTimestamp(session.updatedAt),
    metadata: metadataToProto((session.metadata as Record<string, unknown> | undefined) ?? {}),
  }

  const errMsg = ConversationSessionType.verify(payload)
  if (errMsg) {
    throw new Error(`Session verification failed: ${errMsg}`)
  }

  const sessionProto = ConversationSessionType.create(payload)
  return Buffer.from(ConversationSessionType.encode(sessionProto).finish())
}

/**
 * 将 protobuf Buffer 反序列化为 ConversationSession
 */
export function deserializeSession(buffer: Buffer): ConversationSession {
  const sessionProto = ConversationSessionType.decode(buffer)
  const obj = ConversationSessionType.toObject(sessionProto, {
    longs: Number,
    enums: String,
    bytes: String,
    defaults: true,
    arrays: true,
    objects: true,
    oneofs: true,
  })

  const channelMap: Record<number, string> = {
    1: 'web-chat',
    2: 'voice',
    3: 'api',
  }

  return {
    sessionId: obj.sessionId as string,
    userId: (obj.userId as string | undefined) ?? null,
    tenantId: (obj.tenantId as string | undefined) ?? null,
    channel: (channelMap[obj.channel as number] || 'web-chat') as string,
    title: (obj.title as string | undefined) ?? null,
    deleted: obj.deleted as boolean,
    startedAt: fromTimestamp(obj.startedAt as number),
    lastMessageAt: fromTimestamp(obj.lastMessageAt as number),
    createdAt: fromTimestamp(obj.createdAt as number),
    updatedAt: fromTimestamp(obj.updatedAt as number),
    metadata: metadataFromProto(obj.metadata) as unknown,
  }
}
