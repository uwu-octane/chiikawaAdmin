import { prisma } from '@/db/prisma'
import {
  ConversationMessageSchema,
  type ConversationMessage,
} from '../../schema/conversation/message'
import type { PersistentMessageStore } from '../../schema/conversation/message'
export const prismaMessageStore: PersistentMessageStore = {
  async append(message: ConversationMessage): Promise<void> {
    await prisma.conversation_messages.create({
      data: {
        id: message.id,
        session_id: message.sessionId,
        msg_index: message.index,
        message: message.message as any,
        created_at: message.createdAt,
        updated_at: message.updatedAt,
      },
    })
  },

  async listBySessionId(sessionId: string): Promise<ConversationMessage[]> {
    const rows = await prisma.conversation_messages.findMany({
      where: { session_id: sessionId },
      orderBy: { msg_index: 'asc' },
    })

    // 把 DB 记录映射回你的 Zod 结构，并用 Zod 做一次 parse
    return rows.map((row) =>
      ConversationMessageSchema.parse({
        id: row.id,
        sessionId: row.session_id,
        index: row.msg_index,
        message: row.message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }),
    )
  },
}
