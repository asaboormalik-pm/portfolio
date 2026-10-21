ALTER TABLE "case_studies" ADD COLUMN "location" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "case_studies" ADD COLUMN "location_flag" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "location" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "location_flag" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "availability" text DEFAULT 'hidden' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "highlights" jsonb DEFAULT '[]'::jsonb NOT NULL;