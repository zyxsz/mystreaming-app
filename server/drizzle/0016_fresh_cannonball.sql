CREATE TABLE "storages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"accessKeyId" varchar NOT NULL,
	"secretAccessKey" varchar NOT NULL,
	"region" varchar NOT NULL,
	"bucket" varchar NOT NULL,
	"endpoint" varchar,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "storages_bucket_unique" UNIQUE("bucket")
);
