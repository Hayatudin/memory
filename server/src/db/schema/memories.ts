import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  mysqlEnum,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./auth.js";
import { categories } from "./categories.js";

export const memoryTypeEnum = mysqlEnum("type", [
  "text",
  "image",
  "link",
  "voice",
]);

export const embeddingStatusEnum = mysqlEnum("embedding_status", [
  "none",
  "pending",
  "indexed",
  "failed",
]);

export const memories = mysqlTable(
  "memories",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: varchar("category_id", { length: 36 })
      .references(() => categories.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"), // Text note, transcription for voice, summary, or extracted text
    type: memoryTypeEnum.default("text").notNull(), // text, image, link, voice
    sourceUrl: text("source_url"), // Web link URL or origin URL
    mediaUrl: text("media_url"), // External storage URL for image/voice file
    mediaMetadata: json("media_metadata"), // e.g. { durationSeconds: 42, mimeType: "audio/m4a", fileSize: 1048576 }
    isFavorite: boolean("is_favorite").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    metadata: json("metadata"), // OpenGraph metadata, custom tags, etc.

    // Future AI Readiness (prepared for embeddings & vector retrieval)
    embeddingStatus: embeddingStatusEnum.default("none").notNull(),
    indexedAt: timestamp("indexed_at"),
    contentHash: varchar("content_hash", { length: 64 }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("memories_user_id_idx").on(table.userId),
    categoryIdIdx: index("memories_category_id_idx").on(table.categoryId),
    typeIdx: index("memories_type_idx").on(table.type),
    createdAtIdx: index("memories_created_at_idx").on(table.createdAt),
    embeddingStatusIdx: index("memories_embedding_status_idx").on(table.embeddingStatus),
  })
);
