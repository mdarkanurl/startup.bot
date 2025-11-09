CREATE TABLE "tweets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startupId" text NOT NULL,
	"tweet" text NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL
);
