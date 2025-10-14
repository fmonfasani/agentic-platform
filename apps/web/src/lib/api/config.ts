const FALLBACK_API_URL = 'http://localhost:3000'

export const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL

function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined
  }
  return trimmed.replace(/\/$/, '')
}

export function getApiBaseUrl() {
  const candidates = [process.env.API_URL, process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL, FALLBACK_API_URL]
  for (const candidate of candidates) {
    const normalized = normalizeEnvValue(candidate)
    if (normalized) {
      return normalized
    }
  }
  return FALLBACK_API_URL
}
