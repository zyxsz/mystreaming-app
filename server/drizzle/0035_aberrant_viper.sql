CREATE TABLE "progress" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"titleId" uuid NOT NULL,
	"episodeId" uuid,
	"currentTime" double precision DEFAULT 0,
	"totalDuration" double precision DEFAULT 0,
	"percentage" double precision DEFAULT 0,
	"completed" boolean DEFAULT false,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medias" DROP CONSTRAINT "medias_storageId_storages_id_fk";
--> statement-breakpoint
ALTER TABLE "medias" DROP CONSTRAINT "medias_transcoderId_transcoders_id_fk";
--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_titleId_titles_id_fk" FOREIGN KEY ("titleId") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "progress" ADD CONSTRAINT "progress_episodeId_episodes_id_fk" FOREIGN KEY ("episodeId") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "storageId";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "transcoderId";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "jobId";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "encryptionKey";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "encryptionValue";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "origin";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "size";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "processingStartedAt";--> statement-breakpoint
ALTER TABLE "medias" DROP COLUMN "processingEndedAt";--> statement-breakpoint
DROP TYPE "public"."mediaOrigin";--> statement-breakpoint
DROP TYPE "public"."mediaType";