CREATE TABLE "raw_startup_data" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"text" text NOT NULL,
	"crawledAt" text NOT NULL
);
