CREATE TYPE "public"."storeMetricReferenceType" AS ENUM('UPLOAD', 'ENCODE', 'MEDIA_PLAYBACK');--> statement-breakpoint
CREATE TYPE "public"."storeMetricType" AS ENUM('EGRESS', 'INGRESS', 'DELETE', 'STORE');--> statement-breakpoint
CREATE TABLE "storeMetrics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"authorId" uuid,
	"ipAddress" varchar,
	"location" varchar,
	"key" varchar,
	"bucket" varchar NOT NULL,
	"region" varchar,
	"reference" varchar NOT NULL,
	"referenceType" "storeMetricReferenceType" NOT NULL,
	"bytes" double precision NOT NULL,
	"type" "storeMetricType" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "multipartUploadId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "originalName" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "size" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "uploads" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "storeMetrics" ADD CONSTRAINT "storeMetrics_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;