import { mysqlTable, varchar, text, timestamp, json, uniqueIndex } from "drizzle-orm/mysql-core";
import { users } from "./auth.js";

export const profiles = mysqlTable(
  "profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: varchar("display_name", { length: 100 }),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    timezone: varchar("timezone", { length: 50 }).default("UTC").notNull(),
    preferences: json("preferences"), // e.g. { theme: "dark", defaultMemoryType: "text" }
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdUnique: uniqueIndex("profiles_user_id_unique").on(table.userId),
  })
);
