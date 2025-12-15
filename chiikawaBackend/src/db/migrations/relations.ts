import { relations } from "drizzle-orm/relations";
import { conversationSessions, conversationMessages } from "./schema";

export const conversationMessagesRelations = relations(conversationMessages, ({one}) => ({
	conversationSession: one(conversationSessions, {
		fields: [conversationMessages.sessionId],
		references: [conversationSessions.sessionId]
	}),
}));

export const conversationSessionsRelations = relations(conversationSessions, ({many}) => ({
	conversationMessages: many(conversationMessages),
}));