ALTER TABLE "staff" RENAME COLUMN "user_id" TO "username";
--> statement-breakpoint
ALTER INDEX IF EXISTS "staff_user_id_idx" RENAME TO "staff_username_idx";
