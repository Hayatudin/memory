import {
  mysqlTable,
  varchar,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./auth.js";
import { memories } from "./memories.js";

export const tags = mysqlTable(
  "tags",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userTagNameIdx: uniqueIndex("tags_user_id_name_unique").on(table.userId, table.name),
    userIdIdx: index("tags_user_id_idx").on(table.userId),
  })
);

export const memoryTags = mysqlTable(
  "memory_tags",
  {
    memoryId: varchar("memory_id", { length: 36 })
      .notNull()
      .references(() => memories.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 36 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.memoryId, table.tagId] }),
    tagIdIdx: index("memory_tags_tag_id_idx").on(table.tagId),
  })
);
