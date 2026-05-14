import type { schema } from '@/lib/db'

export type Project = typeof schema.projects.$inferSelect
export type NewProject = typeof schema.projects.$inferInsert

export type Run = typeof schema.runs.$inferSelect
export type NewRun = typeof schema.runs.$inferInsert

export type Log = typeof schema.logs.$inferSelect
export type NewLog = typeof schema.logs.$inferInsert

export type Conversation = typeof schema.conversations.$inferSelect
export type NewConversation = typeof schema.conversations.$inferInsert
