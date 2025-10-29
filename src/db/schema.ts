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


export const raw_startup_data = pgTable("raw_startup_data", {
  id: uuid("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  text: text("text").notNull(),
  crawledAt: text("crawledAt").notNull(),
  VC_firm: text("VC_firm").notNull().default("unknown"),
  services: text("services").notNull().default(""),
  founder_names: text("founder_names").array().notNull().default([]),
  foundedAt: text("foundedAt"),
  isUsed: boolean("isUsed").notNull().default(false),
});
