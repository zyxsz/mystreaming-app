CREATE TYPE "public"."titleImageType" AS ENUM('BANNER', 'POSTER', 'LOGO', 'OTHER', 'THUMBNAIL');--> statement-breakpoint
CREATE TABLE "titleImages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"titleId" uuid,
	"width" integer NOT NULL,
	"height" integer,
	"key" varchar NOT NULL,
	"type" "titleImageType" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "titleImages_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "titleImages" ADD CONSTRAINT "titleImages_titleId_titles_id_fk" FOREIGN KEY ("titleId") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE cascade;