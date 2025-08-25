ALTER TABLE "mediaAssigns" DROP CONSTRAINT "mediaAssigns_titleId_mediaId_pk";--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_id_unique" UNIQUE("id");