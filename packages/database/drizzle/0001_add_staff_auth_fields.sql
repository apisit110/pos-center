ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "user_id" varchar(100);
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "pin_hash" varchar(255);
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "staff_user_id_idx" ON "staff" ("user_id") WHERE "user_id" IS NOT NULL;
