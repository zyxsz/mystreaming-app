ALTER TYPE "public"."mediaStatus" ADD VALUE 'DELETED';--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "processingStartedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "processingEndedAt" timestamp with time zone;