-- +goose Up
-- +goose StatementBegin
-- 1) 先把列从 enum 改成 TEXT
ALTER TABLE conversation_sessions
ALTER COLUMN channel TYPE TEXT USING channel::text;
-- 2) 加一个 CHECK 约束，保持原来的取值范围
ALTER TABLE conversation_sessions
ADD CONSTRAINT chk_conversation_sessions_channel CHECK (channel IN ('web-chat', 'voice', 'api'));
-- 3) 删除不再使用的 enum 类型
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'conversation_channel'
) THEN DROP TYPE conversation_channel;
END IF;
END $$;
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
-- 1) 重新创建 enum 类型（如果不存在）
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'conversation_channel'
) THEN CREATE TYPE conversation_channel AS ENUM ('web-chat', 'voice', 'api');
END IF;
END $$;
-- ⚠️ 注意：这里要求当前表里 channel 的值都在 ('web-chat','voice','api') 之内，否则下面这步会失败
-- 2) 把 TEXT 改回 enum
ALTER TABLE conversation_sessions
ALTER COLUMN channel TYPE conversation_channel USING channel::conversation_channel;
-- 3) 删掉 Up 里加的 CHECK 约束
ALTER TABLE conversation_sessions DROP CONSTRAINT IF EXISTS chk_conversation_sessions_channel;
-- +goose StatementEnd