import { envSchema } from './env.schema';

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error('\nEnvironment validation failed:\n');

    for (const issue of result.error.issues) {
      console.error(`- ${issue.path.join('.')}: ${issue.message}`);
    }

    process.exit(1);
  }

  return result.data;
}
