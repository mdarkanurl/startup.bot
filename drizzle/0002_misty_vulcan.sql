ALTER TABLE "raw_startup_data" ADD COLUMN "VC_firm" text DEFAULT 'unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE "raw_startup_data" ADD COLUMN "services" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "raw_startup_data" ADD COLUMN "founder_names" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "raw_startup_data" ADD COLUMN "foundedAt" text;--> statement-breakpoint
ALTER TABLE "raw_startup_data" ADD COLUMN "isUsed" boolean DEFAULT false NOT NULL;