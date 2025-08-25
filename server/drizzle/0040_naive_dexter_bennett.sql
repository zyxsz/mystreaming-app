ALTER TABLE "medias" DROP CONSTRAINT "medias_originUploadId_uploads_id_fk";
--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "key" varchar;--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "manifestKey" varchar;--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "thumbnailKey" varchar;--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "previewsKey" varchar;--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "duration" double precision;--> statement-breakpoint
ALTER TABLE "encodes" ADD COLUMN "encryptions" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "originUploadId";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "key";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "manifestKey";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "thumbnailKey";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "previewsKey";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "encryptions";