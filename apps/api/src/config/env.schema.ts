import { z } from 'zod';

/**
 * Global Environment Schema
 * ----------------------------------------------------
 * Every environment variable must be declared here.
 * This schema validates configuration during application startup.
 */

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  APP_NAME: z.string().min(1).default('Loss Defender Pro API'),

  PORT: z.coerce.number().int().positive().default(3000),

  API_PREFIX: z.string().default('api'),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES: z.string().default('15m'),

  JWT_REFRESH_EXPIRES: z.string().default('30d'),

  STORAGE_DRIVER: z
    .enum(['local', 'b2', 's3', 'minio'])
    .default('b2'),

  UPLOAD_PATH: z.string().default('uploads'),

  B2_BUCKET_NAME: z.string().min(1),

  B2_ENDPOINT: z.string().min(1),

  B2_REGION: z.string().default('us-east-005'),

  B2_KEY_ID: z.string().min(1),

  B2_APPLICATION_KEY: z.string().min(1),

  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'debug', 'verbose'])
    .default('info'),
});

export type EnvSchema = z.infer<typeof envSchema>;
