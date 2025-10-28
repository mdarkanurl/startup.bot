import { text, pgTable, uuid, boolean } from "drizzle-orm/pg-core";

export const startup = pgTable("startup", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  VC_firm: text("VC_firm").notNull(),
  services: text("services").notNull(),
  founder_names: text("founder_names").array().notNull(),
  foundedAt: text("foundedAt"),
  isUsed: boolean("isUsed").notNull().default(false),
});
