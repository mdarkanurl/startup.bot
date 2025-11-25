ALTER TABLE "startup" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "startup" ALTER COLUMN "founder_names[]" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "startup" ADD COLUMN "website" text NOT NULL;