CREATE TABLE "titlesToGenres" (
	"titleId" uuid NOT NULL,
	"genreId" varchar NOT NULL,
	CONSTRAINT "titlesToGenres_titleId_genreId_pk" PRIMARY KEY("titleId","genreId")
);
--> statement-breakpoint
ALTER TABLE "titlesToGenres" ADD CONSTRAINT "titlesToGenres_titleId_titles_id_fk" FOREIGN KEY ("titleId") REFERENCES "public"."titles"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "titlesToGenres" ADD CONSTRAINT "titlesToGenres_genreId_genres_id_fk" FOREIGN KEY ("genreId") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE cascade;