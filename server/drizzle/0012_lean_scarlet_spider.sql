CREATE TYPE "public"."friendshipRequestStatus" AS ENUM('PENDING', 'ACCEPTED', 'DENIED');--> statement-breakpoint
CREATE TABLE "friendshipRequests" (
	"from" uuid NOT NULL,
	"to" uuid NOT NULL,
	"status" "friendshipRequestStatus",
	"acceptedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendshipRequests_from_to_pk" PRIMARY KEY("from","to")
);
--> statement-breakpoint
ALTER TABLE "friendshipRequests" ADD CONSTRAINT "friendshipRequests_from_users_id_fk" FOREIGN KEY ("from") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "friendshipRequests" ADD CONSTRAINT "friendshipRequests_to_users_id_fk" FOREIGN KEY ("to") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;