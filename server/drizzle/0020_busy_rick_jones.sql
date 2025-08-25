CREATE TYPE "public"."mediaOrigin" AS ENUM('SHAKA-PACKAGER', 'BENTO4-MP4DASH');--> statement-breakpoint
CREATE TYPE "public"."mediaStatus" AS ENUM('CREATED', 'IN_QUEUE', 'PROCESSING', 'AVAILABLE');--> statement-breakpoint
CREATE TYPE "public"."mediaType" AS ENUM('DASH', 'HLS');--> statement-breakpoint
CREATE TABLE "medias" (
	"id" uuid PRIMARY KEY NOT NULL,
	"originUploadId" uuid,
	"transcoderId" uuid,
	"key" varchar NOT NULL,
	"manifestKey" varchar NOT NULL,
	"encryptionKey" varchar,
	"encryptionValue" varchar,
	"type" "mediaType",
	"origin" "mediaOrigin",
	"thumbnailKey" varchar,
	"previewsKey" varchar,
	"status" "mediaStatus" DEFAULT 'CREATED',
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "medias_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_originUploadId_uploads_id_fk" FOREIGN KEY ("originUploadId") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_transcoderId_transcoders_id_fk" FOREIGN KEY ("transcoderId") REFERENCES "public"."transcoders"("id") ON DELETE set null ON UPDATE cascade;