CREATE TYPE "public"."seasonOrigin" AS ENUM('TMDB', 'IMDB', 'LOCAL');--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"titleId" uuid,
	"tmdbId" integer,
	"number" integer,
	"name" varchar,
	"overview" varchar,
	"bannerKey" varchar,
	"airDate" timestamp,
	"rating" double precision,
	"origin" "seasonOrigin",
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "seasons_tmdbId_unique" UNIQUE("tmdbId")
);
--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_titleId_titles_id_fk" FOREIGN KEY ("titleId") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE cascade;