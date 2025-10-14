import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().optional(),
  CORS_ORIGIN: z.string().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  API_URL: z.string().url().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors
  throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted)}`)
}

export const env = parsed.data

export function resolveCorsOrigins() {
  if (!env.CORS_ORIGIN) {
    return ['http://localhost:3000']
  }

  return env.CORS_ORIGIN.split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean)
}
