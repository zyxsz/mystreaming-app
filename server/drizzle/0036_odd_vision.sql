CREATE TYPE "public"."encodeStatus" AS ENUM('IN_QUEUE', 'PROCESSING', 'COMPLETED');--> statement-breakpoint
CREATE TABLE "encodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"inputId" uuid,
	"size" double precision,
	"videoQualities" json DEFAULT '[]'::json,
	"audioQualities" json DEFAULT '[]'::json,
	"progress" double precision DEFAULT 0,
	"status" "encodeStatus" DEFAULT 'IN_QUEUE',
	"costInCents" double precision,
	"startedAt" timestamp with time zone,
	"endedAt" timestamp with time zone,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "encodes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "uploads" DROP CONSTRAINT "uploads_storageId_storages_id_fk";
--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "status" SET DEFAULT 'CREATED'::text;--> statement-breakpoint
DROP TYPE "public"."mediaStatus";--> statement-breakpoint
CREATE TYPE "public"."mediaStatus" AS ENUM('CREATED', 'WAITING_ENCODE', 'AVAILABLE', 'DELETED');--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "status" SET DEFAULT 'CREATED'::"public"."mediaStatus";--> statement-breakpoint
ALTER TABLE "medias" ALTER COLUMN "status" SET DATA TYPE "public"."mediaStatus" USING "status"::"public"."mediaStatus";--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "encodeId" uuid;--> statement-breakpoint
ALTER TABLE "encodes" ADD CONSTRAINT "encodes_inputId_uploads_id_fk" FOREIGN KEY ("inputId") REFERENCES "public"."uploads"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_encodeId_encodes_id_fk" FOREIGN KEY ("encodeId") REFERENCES "public"."encodes"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "uploads" DROP COLUMN "storageId";