CREATE TABLE "startup" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"VC_firm" text DEFAULT 'unknown' NOT NULL,
	"founder_names[]" text[] DEFAULT '{}' NOT NULL,
	"foundedAt" text,
	"web_page_data_id" uuid[]
);
--> statement-breakpoint
CREATE TABLE "web_page_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"text" text NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL
);
