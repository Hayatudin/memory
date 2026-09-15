import { mysqlTable, varchar, text, timestamp, uniqueIndex, index } from "drizzle-orm/mysql-core";
import { users } from "./auth.js";

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 30 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userCategoryNameUnique: uniqueIndex("categories_user_name_unique").on(table.userId, table.name),
    userIdIdx: index("categories_user_id_idx").on(table.userId),
  })
);
