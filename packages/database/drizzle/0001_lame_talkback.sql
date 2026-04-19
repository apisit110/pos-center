ALTER TABLE "products" ALTER COLUMN "uid" SET DATA TYPE varchar(255) USING "uid"::varchar;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "uid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "sku" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "image_url" SET DATA TYPE jsonb USING "image_url"::jsonb;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "uid" SET DATA TYPE varchar(255) USING "uid"::varchar;--> statement-breakpoint
ALTER TABLE "stores" ALTER COLUMN "uid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "store_products" ALTER COLUMN "uid" SET DATA TYPE varchar(255) USING "uid"::varchar;--> statement-breakpoint
ALTER TABLE "store_products" ALTER COLUMN "uid" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "store_products" ALTER COLUMN "unit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "unit_name" varchar(100);--> statement-breakpoint
ALTER TABLE "store_products" ADD COLUMN "price_tiers" jsonb;