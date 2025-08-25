ALTER TABLE "mediaAssigns" DROP CONSTRAINT "mediaAssigns_episodeId_episodes_id_fk";
--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_episodeId_episodes_id_fk" FOREIGN KEY ("episodeId") REFERENCES "public"."episodes"("id") ON DELETE set null ON UPDATE cascade;