ALTER TABLE "web_page_data" ADD COLUMN "startupId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "startup" DROP COLUMN "web_page_data_id";