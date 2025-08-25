CREATE TYPE "public"."uploadStatus" AS ENUM('CREATED', 'UPLOADING', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY NOT NULL,
	"storageId" uuid,
	"key" varchar,
	"originalName" varchar,
	"size" integer,
	"type" varchar,
	"status" "uploadStatus" DEFAULT 'CREATED',
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uploads_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "multipartUploadId" varchar;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_storageId_storages_id_fk" FOREIGN KEY ("storageId") REFERENCES "public"."storages"("id") ON DELETE cascade ON UPDATE cascade;