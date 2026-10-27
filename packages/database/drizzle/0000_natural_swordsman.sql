DO $$ BEGIN
 CREATE TYPE "public"."merchant_credential_provider" AS ENUM('POS_CASHIER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."address_type" AS ENUM('REGISTERED', 'CONTRACT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."wallet_type" AS ENUM('POINT', 'CASH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cashier_staff_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."cashier_staff_sync_status" AS ENUM('PENDING', 'SYNCED', 'ERROR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."sync_status" AS ENUM('IDLE', 'SYNCING', 'ERROR', 'SUCCESS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(100) NOT NULL,
	"partner_id" varchar(20) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_th" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_uid_unique" UNIQUE("uid"),
	CONSTRAINT "merchant_partner_id_unique" UNIQUE("partner_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"mid" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_profile_mid_unique" UNIQUE("mid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_credential" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"provider" "merchant_credential_provider" NOT NULL,
	"client_id" varchar(255) NOT NULL,
	"client_secret" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_credential_client_id_unique" UNIQUE("client_id"),
	CONSTRAINT "merchant_credential_merchant_provider_unique" UNIQUE("merchant_id","provider")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_provinces" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20),
	"name_en" varchar(255),
	"name_th" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "master_provinces_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"province_id" integer,
	"code" varchar(20),
	"name_en" varchar(255),
	"name_th" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "master_districts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_sub_districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer,
	"code" varchar(20),
	"name_en" varchar(255),
	"name_th" varchar(255),
	"latitude" varchar(50),
	"longitude" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "master_sub_districts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "master_postal_code" (
	"id" serial PRIMARY KEY NOT NULL,
	"sub_district_id" integer,
	"code" varchar(10),
	CONSTRAINT "master_postal_code_sub_district_id_code_unique" UNIQUE("sub_district_id","code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "address" (
	"id" serial PRIMARY KEY NOT NULL,
	"province_id" integer NOT NULL,
	"district_id" integer NOT NULL,
	"sub_district_id" integer NOT NULL,
	"postal_code_id" integer NOT NULL,
	"address_1" varchar(255),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_store_address" (
	"store_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	"type" "address_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "map_store_address_store_id_address_id_pk" PRIMARY KEY("store_id","address_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"uid" varchar(100) NOT NULL,
	"sid" varchar(50) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_th" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_uid_unique" UNIQUE("uid"),
	CONSTRAINT "store_sid_unique" UNIQUE("sid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "terminal" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(100) NOT NULL,
	"tid" varchar(50) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_th" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "terminal_uid_unique" UNIQUE("uid"),
	CONSTRAINT "terminal_tid_unique" UNIQUE("tid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_store_terminal" (
	"store_id" integer NOT NULL,
	"terminal_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "map_store_terminal_store_id_terminal_id_pk" PRIMARY KEY("store_id","terminal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(100) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_th" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brand_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"brand_id" integer,
	"uid" varchar(100) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"name_th" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(100),
	"base_price" numeric(10, 4) NOT NULL,
	"image_url" varchar(500),
	"unit_name" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_store_product" (
	"store_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"stock" integer NOT NULL,
	"price" numeric(10, 4) NOT NULL,
	"sync_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "map_store_product_store_id_product_id_pk" PRIMARY KEY("store_id","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_no" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_phone_no_unique" UNIQUE("phone_no")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet" (
	"id" serial PRIMARY KEY NOT NULL,
	"balance" numeric(10, 4) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "map_member_wallet" (
	"member_id" integer NOT NULL,
	"wallet_id" integer NOT NULL,
	"type" "wallet_type" NOT NULL,
	CONSTRAINT "map_member_wallet_member_id_wallet_id_pk" PRIMARY KEY("member_id","wallet_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "center_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(100) NOT NULL,
	"username" varchar(100) NOT NULL,
	"full_name" varchar(255),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "center_staff_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pin" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar(100) NOT NULL,
	"app_id" varchar(20) NOT NULL,
	"username" varchar(100) NOT NULL,
	"pin_hash" varchar(255) NOT NULL,
	"pin_failed_attempts" integer,
	"pin_locked_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pin_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "center_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "center_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "center_staff_role" (
	"staff_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "center_staff_role_staff_id_role_id_pk" PRIMARY KEY("staff_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "center_role_permission" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "center_role_permission_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"uid" varchar(100),
	"username" varchar(100),
	"full_name" varchar(255),
	"status" "cashier_staff_status",
	"sync_status" "cashier_staff_sync_status",
	"sync_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cashier_staff_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_role" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_permission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_staff_role" (
	"staff_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cashier_staff_role_staff_id_role_id_pk" PRIMARY KEY("staff_id","role_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cashier_role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"permission_key" varchar(100),
	"is_granted" boolean
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
CREATE TABLE IF NOT EXISTS "order" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"terminal_id" integer NOT NULL,
	"cashier_staff_id" integer NOT NULL,
	"member_id" integer,
	"order_id" varchar(100) NOT NULL,
	"total_amount" numeric(10, 4) NOT NULL,
	"status" varchar(20) NOT NULL,
	"is_synced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"price" numeric(10, 4) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"pos_temp_id" varchar(100),
	"global_order_id" varchar(100),
	"synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(100) NOT NULL,
	"order_id" varchar(100),
	"merchant_id" integer,
	"store_id" integer,
	"terminal_id" integer,
	"amount" numeric(10, 4),
	"received_amount" numeric(10, 4),
	"change_amount" numeric(10, 4),
	"payment_method" varchar(20),
	"status" varchar(20),
	"staff_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pos_temp_id" varchar(100),
	"store_id" integer,
	"global_transaction_id" varchar(100),
	"synced_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "merchant_profile" ADD CONSTRAINT "merchant_profile_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "merchant_credential" ADD CONSTRAINT "merchant_credential_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_districts" ADD CONSTRAINT "master_districts_province_id_master_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."master_provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_sub_districts" ADD CONSTRAINT "master_sub_districts_district_id_master_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."master_districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "master_postal_code" ADD CONSTRAINT "master_postal_code_sub_district_id_master_sub_districts_id_fk" FOREIGN KEY ("sub_district_id") REFERENCES "public"."master_sub_districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_province_id_master_provinces_id_fk" FOREIGN KEY ("province_id") REFERENCES "public"."master_provinces"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_district_id_master_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."master_districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_sub_district_id_master_sub_districts_id_fk" FOREIGN KEY ("sub_district_id") REFERENCES "public"."master_sub_districts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "address" ADD CONSTRAINT "address_postal_code_id_master_postal_code_id_fk" FOREIGN KEY ("postal_code_id") REFERENCES "public"."master_postal_code"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_address" ADD CONSTRAINT "map_store_address_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_address" ADD CONSTRAINT "map_store_address_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "store" ADD CONSTRAINT "store_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_terminal" ADD CONSTRAINT "map_store_terminal_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_terminal" ADD CONSTRAINT "map_store_terminal_terminal_id_terminal_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_product" ADD CONSTRAINT "map_store_product_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_store_product" ADD CONSTRAINT "map_store_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_member_wallet" ADD CONSTRAINT "map_member_wallet_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "map_member_wallet" ADD CONSTRAINT "map_member_wallet_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "center_staff_role" ADD CONSTRAINT "center_staff_role_staff_id_center_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."center_staff"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "center_staff_role" ADD CONSTRAINT "center_staff_role_role_id_center_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."center_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "center_role_permission" ADD CONSTRAINT "center_role_permission_role_id_center_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."center_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "center_role_permission" ADD CONSTRAINT "center_role_permission_permission_id_center_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."center_permission"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cashier_staff" ADD CONSTRAINT "cashier_staff_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cashier_staff_role" ADD CONSTRAINT "cashier_staff_role_staff_id_cashier_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."cashier_staff"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cashier_staff_role" ADD CONSTRAINT "cashier_staff_role_role_id_cashier_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."cashier_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cashier_role_permissions" ADD CONSTRAINT "cashier_role_permissions_role_id_cashier_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."cashier_role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_merchant_id_merchant_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_terminal_id_terminal_id_fk" FOREIGN KEY ("terminal_id") REFERENCES "public"."terminal"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_cashier_staff_id_cashier_staff_id_fk" FOREIGN KEY ("cashier_staff_id") REFERENCES "public"."cashier_staff"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_sync_logs" ADD CONSTRAINT "order_sync_logs_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "map_store_product_store_id_sync_version_idx" ON "map_store_product" ("store_id","sync_version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "center_staff_username_idx" ON "center_staff" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pin_username_idx" ON "pin" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cashier_staff_username_idx" ON "cashier_staff" ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cashier_staff_merchant_id_idx" ON "cashier_staff" ("merchant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_sync_logs_pos_temp_id_idx" ON "order_sync_logs" ("pos_temp_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_sync_logs_global_order_id_idx" ON "order_sync_logs" ("global_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_order_id_idx" ON "transactions" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_sync_logs_pos_temp_id_idx" ON "transaction_sync_logs" ("pos_temp_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_sync_logs_global_transaction_id_idx" ON "transaction_sync_logs" ("global_transaction_id");