ALTER TABLE "startup" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "startup" ALTER COLUMN "web_page_data_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "web_page_data" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();