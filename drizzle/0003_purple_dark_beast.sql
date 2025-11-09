CREATE TABLE "ai_generated_startup_summary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summary" text[] NOT NULL,
	"startupId" text NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL
);
