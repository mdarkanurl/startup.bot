CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startupId" text NOT NULL,
	"blog" text NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL
);
