ALTER TYPE "public"."storeMetricReferenceType" RENAME TO "storageMetricReferenceType";--> statement-breakpoint
ALTER TYPE "public"."storeMetricType" RENAME TO "storageMetricType";--> statement-breakpoint
ALTER TABLE "storeMetrics" RENAME TO "storageMetrics";--> statement-breakpoint
ALTER TABLE "storageMetrics" DROP CONSTRAINT "storeMetrics_authorId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "storageMetrics" ADD CONSTRAINT "storageMetrics_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;