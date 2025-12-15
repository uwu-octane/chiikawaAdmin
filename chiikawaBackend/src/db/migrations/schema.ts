import { pgTable, integer, bigint, boolean, timestamp, unique, varchar, text, index, check, jsonb, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gooseDbVersion = pgTable("goose_db_version", {
	id: integer().primaryKey().generatedByDefaultAsIdentity({ name: "goose_db_version_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	versionId: bigint("version_id", { mode: "number" }).notNull(),
	isApplied: boolean("is_applied").notNull(),
	tstamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const authUsers = pgTable("auth_users", {
	// TODO: failed to parse database type 'ulid'
	id: unknown("id").primaryKey().notNull(),
	username: varchar({ length: 64 }),
	email: varchar({ length: 256 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	passwordAlgo: varchar("password_algo", { length: 64 }).default('bcrypt').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("auth_users_username_key").on(table.username),
	unique("auth_users_email_key").on(table.email),
]);

export const users = pgTable("users", {
	// TODO: failed to parse database type 'ulid'
	id: unknown("id").primaryKey().notNull(),
	username: varchar({ length: 64 }).notNull(),
	email: varchar({ length: 256 }).notNull(),
	displayName: varchar("display_name", { length: 256 }),
	avatarUrl: varchar("avatar_url", { length: 256 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_username_key").on(table.username),
	unique("users_email_key").on(table.email),
]);

export const conversationSessions = pgTable("conversation_sessions", {
	sessionId: text("session_id").primaryKey().notNull(),
	userId: text("user_id"),
	tenantId: text("tenant_id"),
	channel: text().notNull(),
	title: text(),
	deleted: boolean().default(false).notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).notNull(),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	metadata: jsonb(),
}, (table) => [
	index("idx_conversation_sessions_last_message_at").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_conversation_sessions_tenant_id").using("btree", table.tenantId.asc().nullsLast().op("text_ops")),
	index("idx_conversation_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	check("chk_conversation_sessions_channel", sql`channel = ANY (ARRAY['web-chat'::text, 'voice'::text, 'api'::text])`),
]);

export const conversationMessages = pgTable("conversation_messages", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	msgIndex: integer("msg_index").notNull(),
	message: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_conversation_messages_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_conversation_messages_session_id_index").using("btree", table.sessionId.asc().nullsLast().op("int4_ops"), table.msgIndex.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [conversationSessions.sessionId],
			name: "conversation_messages_session_id_fkey"
		}).onDelete("cascade"),
	check("conversation_messages_msg_index_check", sql`msg_index >= 0`),
]);
