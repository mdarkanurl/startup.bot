import { integer, text, boolean, pgTable, uuid } from "drizzle-orm/pg-core";

export const startup = pgTable("startup", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  description: text("description").notNull(),
  VC_firm: text("VC_firm").notNull(),
  services: text("services").notNull(),
  foundedAt: text("foundedAt"),
  Headquarters: text("Headquarters")
});
