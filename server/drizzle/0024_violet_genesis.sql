ALTER TABLE "medias" ADD COLUMN "storageId" uuid;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "name" varchar;--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "size" integer;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_storageId_storages_id_fk" FOREIGN KEY ("storageId") REFERENCES "public"."storages"("id") ON DELETE set null ON UPDATE cascade;