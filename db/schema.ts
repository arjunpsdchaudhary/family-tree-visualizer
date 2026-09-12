import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  password: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});
