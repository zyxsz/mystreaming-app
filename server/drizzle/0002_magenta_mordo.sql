CREATE TYPE "public"."titleOrigin" AS ENUM('TMDB', 'IMDB', 'LOCAL');--> statement-breakpoint
CREATE TYPE "public"."titleType" AS ENUM('MOVIE', 'TV_SHOW');--> statement-breakpoint
CREATE TABLE "titles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tmdbId" numeric,
	"imdbId" varchar,
	"name" varchar,
	"overview" varchar,
	"tagline" varchar,
	"releaseDate" timestamp,
	"originalLanguage" varchar,
	"popularity" double precision DEFAULT 0,
	"rating" double precision,
	"ratingCount" numeric,
	"bannerKey" varchar,
	"posterKey" varchar,
	"origin" "titleOrigin" NOT NULL,
	"type" "titleType" NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
