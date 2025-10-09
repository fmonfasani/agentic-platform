const DEFAULT_HEALTH_URL =
  process.env.AGENT_DIAGNOSTICS_HEALTH_URL ?? 'http://localhost:3001/api/dashboard/areas'

async function main() {
  try {
    const response = await fetch(DEFAULT_HEALTH_URL)

    if (!response.ok) {
      console.error(
        `Health check failed for ${DEFAULT_HEALTH_URL}: ${response.status} ${response.statusText}`,
      )
      process.exitCode = 1
      return
    }

    console.log(`Health check succeeded for ${DEFAULT_HEALTH_URL}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Health check error for ${DEFAULT_HEALTH_URL}: ${message}`)
    process.exitCode = 1
  }
}

void main()
