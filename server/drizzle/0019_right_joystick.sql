CREATE TABLE "transcoders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"accessKeyId" varchar NOT NULL,
	"secretAccessKey" varchar NOT NULL,
	"region" varchar NOT NULL,
	"endpoint" varchar,
	"jobDefinition" varchar NOT NULL,
	"jobQueue" varchar NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now(),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transcoders_id_unique" UNIQUE("id"),
	CONSTRAINT "transcoders_jobDefinition_unique" UNIQUE("jobDefinition"),
	CONSTRAINT "transcoders_jobQueue_unique" UNIQUE("jobQueue")
);
