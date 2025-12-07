import { prisma } from '@/db/prisma'
import { Prisma } from '@/db/generated/prisma/client'
import {
  ConversationSessionSchema,
  type ConversationSession,
  type SessionStore,
} from '../../schema/conversation/session'

export const prismaSessionStore: SessionStore = {
  async getById(id: string): Promise<ConversationSession | null> {
    const row = await prisma.conversation_sessions.findUnique({
      where: { session_id: id },
    })

    if (!row) return null

    return ConversationSessionSchema.parse({
      sessionId: row.session_id,
      userId: row.user_id,
      tenantId: row.tenant_id,
      channel: row.channel,
      title: row.title,
      deleted: row.deleted,
      startedAt: row.started_at,
      lastMessageAt: row.last_message_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata as Record<string, unknown> | undefined,
    })
  },

  async upsert(session: ConversationSession): Promise<void> {
    await prisma.conversation_sessions.upsert({
      where: { session_id: session.sessionId },
      update: {
        user_id: session.userId,
        tenant_id: session.tenantId,
        channel: session.channel,
        title: session.title,
        deleted: session.deleted ?? false,
        started_at: session.startedAt,
        last_message_at: session.lastMessageAt,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
        metadata: session.metadata as Prisma.InputJsonValue | null | undefined,
      },
      create: {
        session_id: session.sessionId,
        user_id: session.userId,
        tenant_id: session.tenantId,
        channel: session.channel,
        title: session.title,
        deleted: session.deleted ?? false,
        started_at: session.startedAt,
        last_message_at: session.lastMessageAt,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
        metadata: session.metadata as Prisma.InputJsonValue | null | undefined,
      },
    })
  },
}
