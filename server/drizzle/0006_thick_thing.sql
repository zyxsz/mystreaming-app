ALTER TABLE "genres" ALTER COLUMN "externalId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "titles" ADD COLUMN "externalIdentifier" varchar;--> statement-breakpoint
ALTER TABLE "titles" ADD CONSTRAINT "titles_externalIdentifier_unique" UNIQUE("externalIdentifier");