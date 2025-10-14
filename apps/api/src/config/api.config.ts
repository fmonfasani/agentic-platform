import { env, resolveCorsOrigins } from './env'

const DEFAULT_PORT = 3001

export const apiConfig = {
  port: env.PORT ?? DEFAULT_PORT,
  corsOrigins: resolveCorsOrigins(),
  openai: {
    apiKey: env.OPENAI_API_KEY ?? null,
  },
}

export type ApiConfig = typeof apiConfig
