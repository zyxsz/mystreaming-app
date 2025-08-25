CREATE TYPE "public"."episodesOrigin" AS ENUM('TMDB', 'IMDB', 'LOCAL');--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"seasonId" uuid,
	"tmdbId" integer,
	"imdbId" varchar,
	"number" integer,
	"name" varchar,
	"overview" varchar,
	"bannerKey" varchar,
	"rating" double precision,
	"airDate" timestamp,
	"origin" "episodesOrigin",
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "episodes_tmdbId_unique" UNIQUE("tmdbId"),
	CONSTRAINT "episodes_imdbId_unique" UNIQUE("imdbId")
);
--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_seasonId_seasons_id_fk" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE cascade;