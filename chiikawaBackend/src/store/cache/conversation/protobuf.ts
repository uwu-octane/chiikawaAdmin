import { join } from 'path'
import { loadSync, type Root } from 'protobufjs'
import type { ConversationMessage } from '../../schema/conversation/message'
import type { ConversationSession } from '../../schema/conversation/session'
import type { UIMessage } from 'ai'

// 加载 proto 文件
const protoPath = join(process.cwd(), 'proto', 'conversation.proto')
const root: Root = loadSync(protoPath)
const ConversationMessageType = root.lookupType('conversation.ConversationMessage')
const ConversationSessionType = root.lookupType('conversation.ConversationSession')

/**
 * 将 Date 转换为 Unix 时间戳（毫秒）
 */
function dateToTimestamp(date: Date): number {
  return date.getTime()
}

/**
 * 将 Unix 时间戳（毫秒）转换为 Date
 */
function timestampToDate(timestamp: number): Date {
  return new Date(timestamp)
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
    index: message.index,
    uiMessageJson: JSON.stringify(message.message as UIMessage),
    createdAt: dateToTimestamp(message.createdAt),
    updatedAt: dateToTimestamp(message.updatedAt),
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

  // 还原 UIMessage
  const uiMessage = JSON.parse(obj.uiMessageJson as string) as UIMessage

  return {
    id: obj.id as string,
    sessionId: obj.sessionId as string,
    index: obj.index as number,
    message: uiMessage,
    createdAt: timestampToDate(obj.createdAt as number),
    updatedAt: timestampToDate(obj.updatedAt as number),
    // 如果你在 proto 里保留了 metadata 字段，可以在 TS ConversationMessage 加 metadata 再转回来
  }
}

/**
 * 将 ConversationSession 序列化为 protobuf Buffer
 */
export function serializeSession(session: ConversationSession): Buffer {
  const payload = {
    sessionId: session.sessionId,
    userId: session.userId,
    tenantId: session.tenantId,
    channel: session.channel === 'web-chat' ? 1 : session.channel === 'voice' ? 2 : 3,
    title: session.title,
    deleted: session.deleted,
    startedAt: dateToTimestamp(session.startedAt),
    lastMessageAt: dateToTimestamp(session.lastMessageAt),
    createdAt: dateToTimestamp(session.createdAt),
    updatedAt: dateToTimestamp(session.updatedAt),
    metadata: metadataToProto(session.metadata),
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

  const channelMap: Record<number, ConversationSession['channel']> = {
    1: 'web-chat',
    2: 'voice',
    3: 'api',
  }

  return {
    sessionId: obj.sessionId,
    userId: obj.userId,
    tenantId: obj.tenantId,
    channel: (channelMap[obj.channel as number] || 'web-chat') as ConversationSession['channel'],
    title: obj.title,
    deleted: obj.deleted,
    startedAt: timestampToDate(obj.startedAt as number),
    lastMessageAt: timestampToDate(obj.lastMessageAt as number),
    createdAt: timestampToDate(obj.createdAt as number),
    updatedAt: timestampToDate(obj.updatedAt as number),
    metadata: metadataFromProto(obj.metadata),
  }
}
