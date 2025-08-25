import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  // S3_ACCESS_KEY_ID: z.string(),
  // S3_SECRET_ACCESS_KEY: z.string(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  // S3_ENDPOINT: z.string().optional(),
  AWS_REGION: z.string(),

  TMDB_ENDPOINT: z.string(),
  TMDB_API_TOKEN: z.string(),
  IMAGE_PROCESSOR_SQS_QUEUE: z.string(),
  HOST_URL: z.string(),
  // IMAGE_PROCESSOR_SQS_REGION: z.string(),
  ENCRYPTION_SECRET: z.string(),
  ENCRYPTION_IV: z.string(),
  SQS_ENCODE_QUEUE: z.string(),
  AWS_LAMBDA_FUNCTION_NAME: z.string().optional(),
  // SQS_ENCODE_NOTIFICATIONS_QUEUE: z.string(),
  // SQS_ENCODE_REGION: z.string(),
  // Add other environment variables here

  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_PUBLIC_DOMAIN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
