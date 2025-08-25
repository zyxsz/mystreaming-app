ALTER TABLE "mediaAssigns" DROP CONSTRAINT "mediaAssigns_titleId_mediaId_episodeId_pk";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_titleId_mediaId_pk" PRIMARY KEY("titleId","mediaId");