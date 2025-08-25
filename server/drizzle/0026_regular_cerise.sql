CREATE TYPE "public"."playbackStatus" AS ENUM('CREATED', 'ALIVE', 'INACTIVE', 'EXPIRED', 'FINISHED', 'CLOSED');--> statement-breakpoint
ALTER TABLE "playbacks" ADD COLUMN "currentTime" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "playbacks" ADD COLUMN "status" "playbackStatus" DEFAULT 'CREATED';--> statement-breakpoint
ALTER TABLE "playbacks" ADD COLUMN "lastKeepAliveAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "playbacks" ADD COLUMN "expiresAt" timestamp with time zone;