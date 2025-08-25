ALTER TABLE "uploads" DROP CONSTRAINT "uploads_storageId_storages_id_fk";
--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_storageId_storages_id_fk" FOREIGN KEY ("storageId") REFERENCES "public"."storages"("id") ON DELETE set null ON UPDATE cascade;