DO $$ BEGIN
 CREATE TYPE "public"."sync_status" AS ENUM('IDLE', 'SYNCING', 'ERROR', 'SUCCESS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PAID', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchants" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"mid" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "merchants_uid_unique" UNIQUE("uid"),
	CONSTRAINT "merchants_mid_unique" UNIQUE("mid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"merchant_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"base_price" numeric(10, 2) NOT NULL,
	"image_url" jsonb,
	"brand" varchar(100),
	"unit_name" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"sid" varchar(50) NOT NULL,
	"merchant_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stores_uid_unique" UNIQUE("uid"),
	CONSTRAINT "stores_sid_unique" UNIQUE("sid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"store_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"price_tiers" jsonb,
	"unit" varchar(50),
	"row_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "store_products_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"tier" varchar(20) DEFAULT 'Bronze' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "members_uid_unique" UNIQUE("uid"),
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"merchant_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_uid_unique" UNIQUE("uid")
);
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
CREATE TABLE IF NOT EXISTS "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_code" varchar(100) NOT NULL,
	"branch_name" varchar(255) NOT NULL,
	CONSTRAINT "branches_branch_code_unique" UNIQUE("branch_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_key" varchar(255) NOT NULL,
	"is_granted" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_name" varchar(255) NOT NULL,
	"level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_branch_access" (
	"user_id" uuid NOT NULL,
	"branch_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pos_temp_id" uuid NOT NULL,
	"origin_branch_id" integer NOT NULL,
	"global_user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"pin_hash" varchar(255) NOT NULL,
	"role_id" integer NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "terminals" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"store_id" integer NOT NULL,
	"tid" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "terminals_uid_unique" UNIQUE("uid"),
	CONSTRAINT "terminals_tid_unique" UNIQUE("tid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_uid" varchar(255),
	"name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pos_temp_id" varchar(255) NOT NULL,
	"store_id" integer NOT NULL,
	"global_order_id" integer NOT NULL,
	"synced_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"merchant_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"terminal_id" integer,
	"staff_id" integer,
	"total_amount" numeric(12, 2) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pos_temp_id" varchar(255) NOT NULL,
	"store_id" integer NOT NULL,
	"global_transaction_id" integer NOT NULL,
	"synced_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(255) NOT NULL,
	"order_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"staff_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "transactions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stores" ADD CONSTRAINT "stores_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_products" ADD CONSTRAINT "store_products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store_products" ADD CONSTRAINT "store_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "staff" ADD CONSTRAINT "staff_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_branch_access" ADD CONSTRAINT "user_branch_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_branch_access" ADD CONSTRAINT "user_branch_access_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sync_logs" ADD CONSTRAINT "user_sync_logs_origin_branch_id_branches_id_fk" FOREIGN KEY ("origin_branch_id") REFERENCES "public"."branches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sync_logs" ADD CONSTRAINT "user_sync_logs_global_user_id_users_id_fk" FOREIGN KEY ("global_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "terminals" ADD CONSTRAINT "terminals_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_sync_logs" ADD CONSTRAINT "order_sync_logs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_sync_logs" ADD CONSTRAINT "order_sync_logs_global_order_id_orders_id_fk" FOREIGN KEY ("global_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_terminal_id_terminals_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_sync_logs" ADD CONSTRAINT "transaction_sync_logs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_sync_logs" ADD CONSTRAINT "transaction_sync_logs_global_transaction_id_transactions_id_fk" FOREIGN KEY ("global_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "users" ("user_id");