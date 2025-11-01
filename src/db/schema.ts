import { relations } from "drizzle-orm";
import { text, pgTable, uuid, boolean } from "drizzle-orm/pg-core";

export const web_page_data = pgTable("web_page_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  text: text("text").notNull(),
  isUsed: boolean("isUsed").notNull().default(false),
});

export const startup = pgTable("startup", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  VC_firm: text("VC_firm").notNull().default("unknown"),
  founder_names: text("founder_names[]").array().notNull().default([]),
  foundedAt: text("foundedAt"),
  web_page_data_ids: uuid("web_page_data_id")
    .array()
    .references(() => web_page_data.id),
});

export const startupRelations = relations(startup, ({ one }) => ({
  web_page_data: one(web_page_data, {
    fields: [startup.web_page_data_ids],
    references: [web_page_data.id],
  }),
}));

export const webPageDataRelations = relations(web_page_data, ({ many }) => ({
  startups: many(startup),
}));
