ALTER TABLE "ai_generated_startup_summary" ADD COLUMN "isUsedForTweets" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generated_startup_summary" ADD COLUMN "isUsedForBlogs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generated_startup_summary" DROP COLUMN "isUsed";