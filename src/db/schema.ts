import { text, pgTable, uuid, boolean } from "drizzle-orm/pg-core";

export const web_page_data = pgTable("web_page_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  text: text("text").notNull(),
  isUsed: boolean("isUsed").notNull().default(false),
  startupId: text("startupId").notNull(),
});

export const startup = pgTable("startup", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  VC_firm: text("VC_firm").notNull().default("unknown"),
  founder_names: text("founder_names[]").array().notNull().default([]),
  foundedAt: text("foundedAt")
});

export const ai_generated_startup_summary = pgTable("ai_generated_startup_summary", {
  id: uuid("id").defaultRandom().primaryKey(),
  summary: text("summary").array().notNull(),
  startupId: text("startupId").notNull(),
  isUsedForTweets: boolean("isUsedForTweets").notNull().default(false),
  isUsedForBlogs: boolean("isUsedForBlogs").notNull().default(false),
});

export const tweets = pgTable("tweets", {
  id: uuid("id").defaultRandom().primaryKey(),
  startupId: text("startupId").notNull(),
  tweet: text("tweet").notNull(),
  isUsed: boolean("isUsed").notNull().default(false),
});

export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  startupId: text("startupId").notNull(),
  blog: text("blog").notNull(),
  isUsed: boolean("isUsed").notNull().default(false),
});