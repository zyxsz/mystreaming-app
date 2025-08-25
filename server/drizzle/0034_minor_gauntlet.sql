CREATE TABLE "mediaAssigns" (
	"titleId" uuid NOT NULL,
	"mediaId" uuid NOT NULL,
	"episodeId" uuid,
	"assignedBy" uuid,
	"assignedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mediaAssigns_titleId_mediaId_episodeId_pk" PRIMARY KEY("titleId","mediaId","episodeId")
);
--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_titleId_titles_id_fk" FOREIGN KEY ("titleId") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_mediaId_medias_id_fk" FOREIGN KEY ("mediaId") REFERENCES "public"."medias"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_episodeId_episodes_id_fk" FOREIGN KEY ("episodeId") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mediaAssigns" ADD CONSTRAINT "mediaAssigns_assignedBy_users_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;