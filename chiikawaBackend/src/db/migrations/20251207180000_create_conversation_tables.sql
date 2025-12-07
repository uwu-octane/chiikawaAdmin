-- +goose Up
-- +goose StatementBegin
-- 会话来源渠道枚举：web-chat / voice / api
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'conversation_channel'
) THEN CREATE TYPE conversation_channel AS ENUM ('web-chat', 'voice', 'api');
END IF;
END $$;
-- 会话表
CREATE TABLE IF NOT EXISTS conversation_sessions (
    -- Zod: sessionId: z.string()
    session_id TEXT PRIMARY KEY,
    -- Zod: userId?: z.string().optional()
    user_id TEXT,
    -- Zod: tenantId?: z.string().optional()
    tenant_id TEXT,
    -- Zod: channel: ConversationChannelSchema
    channel conversation_channel NOT NULL,
    -- Zod: title?: z.string().optional()
    title TEXT,
    -- Zod: deleted?: z.boolean().optional()
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    -- Zod: startedAt: z.date()
    started_at TIMESTAMPTZ NOT NULL,
    -- Zod: lastMessageAt: z.date()
    last_message_at TIMESTAMPTZ NOT NULL,
    -- Zod: createdAt: z.date()
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Zod: updatedAt: z.date()
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Zod: metadata?: z.record(z.string(), z.unknown()).optional()
    metadata JSONB
);
-- 常用查询索引：按用户 / 租户 / 最近消息时间
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_tenant_id ON conversation_sessions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_last_message_at ON conversation_sessions (last_message_at DESC);
-- 消息表
CREATE TABLE IF NOT EXISTS conversation_messages (
    -- Zod: id: z.string()
    id TEXT PRIMARY KEY,
    -- Zod: sessionId: z.string()
    session_id TEXT NOT NULL REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
    -- Zod: index: z.number().int().nonnegative()
    msg_index INTEGER NOT NULL CHECK (msg_index >= 0),
    -- Zod: message: z.custom<UIMessage>()
    -- UIMessage 直接存成 JSON，Go 里用类型做 Marshal/Unmarshal
    message JSONB NOT NULL,
    -- Zod: createdAt: z.date()
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Zod: updatedAt: z.date()
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 为会话内按 index 排序查询加索引
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id_index ON conversation_messages (session_id, msg_index);
-- 如果需要按 created_at 查询，也可以建索引
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages (created_at DESC);
-- ========= 通用时间戳 Hook =========
-- 通用函数：插入时自动填充 created_at（如为空），
-- 插入/更新时自动更新 updated_at
CREATE OR REPLACE FUNCTION set_timestamp() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'INSERT' THEN IF NEW.created_at IS NULL THEN NEW.created_at := NOW();
END IF;
END IF;
NEW.updated_at := NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- 会话表的 trigger
CREATE TRIGGER trg_set_timestamp_conversation_sessions BEFORE
INSERT
    OR
UPDATE ON conversation_sessions FOR EACH ROW EXECUTE FUNCTION set_timestamp();
-- 消息表的 trigger
CREATE TRIGGER trg_set_timestamp_conversation_messages BEFORE
INSERT
    OR
UPDATE ON conversation_messages FOR EACH ROW EXECUTE FUNCTION set_timestamp();
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
-- 先删 trigger 再删 function / 表 / type
DROP TRIGGER IF EXISTS trg_set_timestamp_conversation_messages ON conversation_messages;
DROP TRIGGER IF EXISTS trg_set_timestamp_conversation_sessions ON conversation_sessions;
DROP FUNCTION IF EXISTS set_timestamp();
DROP INDEX IF EXISTS idx_conversation_messages_created_at;
DROP INDEX IF EXISTS idx_conversation_messages_session_id_index;
DROP TABLE IF EXISTS conversation_messages;
DROP INDEX IF EXISTS idx_conversation_sessions_last_message_at;
DROP INDEX IF EXISTS idx_conversation_sessions_tenant_id;
DROP INDEX IF EXISTS idx_conversation_sessions_user_id;
DROP TABLE IF EXISTS conversation_sessions;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'conversation_channel'
) THEN DROP TYPE conversation_channel;
END IF;
END $$;
-- +goose StatementEnd