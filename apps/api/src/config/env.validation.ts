export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  if (!config.DATABASE_URL || typeof config.DATABASE_URL !== "string") {
    throw new Error("DATABASE_URL must be a non-empty string");
  }

  return config;
}
