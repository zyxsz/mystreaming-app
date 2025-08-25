CREATE TABLE "playbacks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid,
	"mediaId" uuid,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "playbacks_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "playbacks" ADD CONSTRAINT "playbacks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "playbacks" ADD CONSTRAINT "playbacks_mediaId_medias_id_fk" FOREIGN KEY ("mediaId") REFERENCES "public"."medias"("id") ON DELETE set null ON UPDATE cascade;