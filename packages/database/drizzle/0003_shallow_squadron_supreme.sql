DO $$ BEGIN
 CREATE TYPE "public"."sync_status" AS ENUM('IDLE', 'SYNCING', 'ERROR', 'SUCCESS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "running_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "running_numbers_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"last_product_sync_version" integer DEFAULT 0 NOT NULL,
	"status" "sync_status" DEFAULT 'IDLE' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "store_products" ADD COLUMN "row_version" integer DEFAULT 0 NOT NULL;