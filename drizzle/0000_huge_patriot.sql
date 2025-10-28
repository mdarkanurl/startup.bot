CREATE TABLE "startup" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text NOT NULL,
	"description" text NOT NULL,
	"VC_firm" text NOT NULL,
	"services" text NOT NULL,
	"founder_names" text[] NOT NULL,
	"foundedAt" text,
	"isUsed" boolean DEFAULT false NOT NULL
);
