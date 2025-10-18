import { integer, text, PgArray, pgTable, uuid } from "drizzle-orm/pg-core";

export const startup = pgTable("startup", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  VC_firm: text("VC_firm").notNull(),
  services: text("services").notNull(),
  former_names: text("former_names").array().notNull(),
  foundedAt: text("foundedAt"),
});
