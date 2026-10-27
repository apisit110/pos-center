CREATE TABLE IF NOT EXISTS "rate_limits" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
