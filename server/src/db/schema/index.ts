import { relations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth.js";
import { profiles } from "./profiles.js";
import { categories } from "./categories.js";
import { memories } from "./memories.js";
import { tags, memoryTags } from "./tags.js";

// Export all tables
export * from "./auth.js";
export * from "./profiles.js";
export * from "./categories.js";
export * from "./memories.js";
export * from "./tags.js";

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  categories: many(categories),
  memories: many(memories),
  tags: many(tags),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  memories: many(memories),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const memoriesRelations = relations(memories, ({ one, many }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [memories.categoryId],
    references: [categories.id],
  }),
  memoryTags: many(memoryTags),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  memoryTags: many(memoryTags),
}));

export const memoryTagsRelations = relations(memoryTags, ({ one }) => ({
  memory: one(memories, {
    fields: [memoryTags.memoryId],
    references: [memories.id],
  }),
  tag: one(tags, {
    fields: [memoryTags.tagId],
    references: [tags.id],
  }),
}));
