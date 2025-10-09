import { execSync } from 'node:child_process'
import * as path from 'node:path'

type TestStatus = 'passed' | 'failed'
type ApiStatus = 'online' | 'offline'

type ExecSyncError = Error & {
  status?: number | null
  stdout?: string | Buffer
  stderr?: string | Buffer
}

interface CommandResult {
  label: string
  command: string
  exitCode: number
  stdout: string
  stderr: string
  status: TestStatus
  errorMessage?: string
}

const repoRoot = path.resolve(__dirname, '..')

const HEALTH_PROBE_COMMAND =
  process.env.AGENT_DIAGNOSTICS_HEALTH_COMMAND ?? 'pnpm exec node reporter/health-probe'
const API_TEST_COMMAND =
  process.env.AGENT_DIAGNOSTICS_API_TEST_COMMAND ??
  'pnpm exec jest --config apps/api/jest.config.ts'
const WEB_TEST_COMMAND =
  process.env.AGENT_DIAGNOSTICS_WEB_TEST_COMMAND ??
  'pnpm exec jest --config apps/web/jest.config.ts'

function normaliseOutput(value: string | Buffer | undefined): string {
  if (value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  return value.toString('utf8')
}

function runCommand(label: string, command: string): CommandResult {
  try {
    const stdout = execSync(command, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    })

    return {
      label,
      command,
      exitCode: 0,
      stdout,
      stderr: '',
      status: 'passed',
    }
  } catch (error) {
    const execError = error as ExecSyncError
    const exitCode = typeof execError.status === 'number' ? execError.status ?? 1 : 1

    return {
      label,
      command,
      exitCode,
      stdout: normaliseOutput(execError.stdout),
      stderr: normaliseOutput(execError.stderr),
      status: 'failed',
      errorMessage: execError.message,
    }
  }
}

function formatBlock(value: string): string {
  const trimmed = value.replace(/\s+$/u, '')
  return trimmed.length > 0 ? trimmed : '[no output]'
}

function printMarkdown(results: {
  timestamp: string
  apiStatus: ApiStatus
  healthProbe: CommandResult
  apiTests: CommandResult
  webTests: CommandResult
}) {
  const { timestamp, apiStatus, healthProbe, apiTests, webTests } = results

  console.log('# Agent Diagnostics Report')
  console.log('')
  console.log(`- Timestamp: ${timestamp}`)
  console.log(`- API status: ${apiStatus}`)
  console.log('')

  console.log('## Summary')
  console.log('| Check | Status | Exit code |')
  console.log('| --- | --- | --- |')
  console.log(`| API health probe | ${apiStatus} | ${healthProbe.exitCode} |`)
  console.log(`| API test suite | ${apiTests.status} | ${apiTests.exitCode} |`)
  console.log(`| Web test suite | ${webTests.status} | ${webTests.exitCode} |`)
  console.log('')

  for (const result of [healthProbe, apiTests, webTests]) {
    console.log(`### ${result.label}`)
    console.log(`- Command: \`${result.command}\``)
    console.log(`- Status: ${result.label === 'API health probe' ? apiStatus : result.status}`)
    console.log(`- Exit code: ${result.exitCode}`)
    console.log('')

    if (result.errorMessage) {
      console.log('#### Error')
      console.log('```')
      console.log(formatBlock(result.errorMessage))
      console.log('```')
      console.log('')
    }

    console.log('#### Stdout')
    console.log('```')
    console.log(formatBlock(result.stdout))
    console.log('```')
    console.log('')

    console.log('#### Stderr')
    console.log('```')
    console.log(formatBlock(result.stderr))
    console.log('```')
    console.log('')
  }
}

function printJson(results: {
  timestamp: string
  apiStatus: ApiStatus
  healthProbe: CommandResult
  apiTests: CommandResult
  webTests: CommandResult
}) {
  const payload = {
    timestamp: results.timestamp,
    api: {
      status: results.apiStatus,
      command: results.healthProbe.command,
      exitCode: results.healthProbe.exitCode,
      stdout: results.healthProbe.stdout,
      stderr: results.healthProbe.stderr,
      error: results.healthProbe.errorMessage ?? null,
    },
    tests: {
      api: {
        status: results.apiTests.status,
        command: results.apiTests.command,
        exitCode: results.apiTests.exitCode,
        stdout: results.apiTests.stdout,
        stderr: results.apiTests.stderr,
        error: results.apiTests.errorMessage ?? null,
      },
      web: {
        status: results.webTests.status,
        command: results.webTests.command,
        exitCode: results.webTests.exitCode,
        stdout: results.webTests.stdout,
        stderr: results.webTests.stderr,
        error: results.webTests.errorMessage ?? null,
      },
    },
  }

  console.log(JSON.stringify(payload, null, 2))
}

const args = process.argv.slice(2)
const useJson = args.includes('--json')

const healthProbeResult = runCommand('API health probe', HEALTH_PROBE_COMMAND)
const apiTestResult = runCommand('API test suite', API_TEST_COMMAND)
const webTestResult = runCommand('Web test suite', WEB_TEST_COMMAND)

const timestamp = new Date().toISOString()
const apiStatus: ApiStatus = healthProbeResult.exitCode === 0 ? 'online' : 'offline'

const summary = {
  timestamp,
  apiStatus,
  healthProbe: healthProbeResult,
  apiTests: apiTestResult,
  webTests: webTestResult,
}

if (useJson) {
  printJson(summary)
} else {
  printMarkdown(summary)
}

if ([healthProbeResult, apiTestResult, webTestResult].some((result) => result.exitCode !== 0)) {
  process.exitCode = 1
}
