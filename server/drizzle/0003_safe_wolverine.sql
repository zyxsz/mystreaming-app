CREATE TABLE "genres" (
	"id" varchar PRIMARY KEY NOT NULL,
	"externalId" numeric NOT NULL,
	"name" varchar,
	"defaultLanguage" varchar,
	CONSTRAINT "genres_id_unique" UNIQUE("id")
);
