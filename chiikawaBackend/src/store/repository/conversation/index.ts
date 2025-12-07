import type { SessionRepository } from './session-repo'
import type { MessageRepository } from './message-repo'
import type { MemoRepository } from './memo-repo'

/**
 * 会话域统一仓库：
 * - sessions: 会话元数据
 * - messages: 原始消息
 * - memos:    会话摘要记忆
 */
export type ConversationRepository = {
  sessions: SessionRepository
  messages: MessageRepository
  memos: MemoRepository
}

export type { SessionRepository } from './session-repo'
export type { MessageRepository } from './message-repo'
export type { MemoRepository } from './memo-repo'

