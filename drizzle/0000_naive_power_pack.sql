CREATE TABLE "startup" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"VC_firm" text DEFAULT 'unknown' NOT NULL,
	"founder_names[]" text[] DEFAULT '{}' NOT NULL,
	"foundedAt" text,
	"web_page_data_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "web_page_data" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"text" text NOT NULL,
	"crawledAt" text NOT NULL,
	"isUsed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "startup" ADD CONSTRAINT "startup_web_page_data_id_web_page_data_id_fk" FOREIGN KEY ("web_page_data_id") REFERENCES "public"."web_page_data"("id") ON DELETE no action ON UPDATE no action;