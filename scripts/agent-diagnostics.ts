#!/usr/bin/env tsx
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import * as path from 'path';

interface CheckDefinition {
  name: string;
  command: string;
  args?: string[];
  cwd?: string;
}

interface CheckResult extends CheckDefinition {
  status: 'passed' | 'failed' | 'errored';
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  errorMessage?: string;
}

const checks: CheckDefinition[] = [
  {
    name: 'Build API package',
    command: 'pnpm',
    args: ['-C', 'apps/api', 'build'],
  },
  {
    name: 'Run root tests',
    command: 'pnpm',
    args: ['test'],
  },
];

async function ensureReportsDirectory() {
  const reportsPath = path.resolve(process.cwd(), 'reports');
  await mkdir(reportsPath, { recursive: true });
}

function runCheck(definition: CheckDefinition): Promise<CheckResult> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(definition.command, definition.args ?? [], {
      cwd: definition.cwd ?? process.cwd(),
      shell: false,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    let errorMessage: string | undefined;
    let resolved = false;

    const finalize = (status: CheckResult['status'], exitCode: number | null, error?: string) => {
      if (resolved) return;
      resolved = true;
      const durationMs = Date.now() - startedAt;

      resolve({
        ...definition,
        status,
        exitCode,
        durationMs,
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        errorMessage: error,
      });
    };

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      errorMessage = error.message;
      finalize('errored', null, error.message);
    });

    child.on('close', (code) => {
      const status: CheckResult['status'] = errorMessage
        ? 'errored'
        : code === 0
        ? 'passed'
        : 'failed';

      finalize(status, code, errorMessage);
    });
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  return `${seconds.toFixed(1)}s`;
}

function renderMarkdown(results: CheckResult[]): string {
  const header = '# Agent Diagnostics\n\n';
  const tableHeader = '| Check | Status | Duration |\n| --- | --- | --- |\n';
  const tableBody = results
    .map((result) => {
      const symbol =
        result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      return `| ${result.name} | ${symbol} | ${formatDuration(result.durationMs)} |`;
    })
    .join('\n');

  const sections = results
    .map((result) => {
      const symbol =
        result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      const parts = [`## ${symbol} ${result.name}`, '', '**Command**', '', `\`${[result.command, ...(result.args ?? [])].join(' ')}\``];

      if (result.exitCode !== null) {
        parts.push('', `**Exit code:** ${result.exitCode}`);
      }

      parts.push('', `**Duration:** ${formatDuration(result.durationMs)}`);

      if (result.errorMessage) {
        parts.push('', `**Error:** ${result.errorMessage}`);
      }

      if (result.stdout) {
        parts.push('', '**Stdout**', '', '```', result.stdout, '```');
      }

      if (result.stderr) {
        parts.push('', '**Stderr**', '', '```', result.stderr, '```');
      }

      return parts.join('\n');
    })
    .join('\n\n');

  return `${header}${tableHeader}${tableBody}\n\n${sections}\n`;
}

function renderJson(results: CheckResult[]): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      checks: results,
    },
    null,
    2,
  );
}

async function main() {
  await ensureReportsDirectory();
  const shouldOutputJson = process.argv.includes('--json');

  const results: CheckResult[] = [];
  for (const check of checks) {
    // eslint-disable-next-line no-await-in-loop
    const result = await runCheck(check);
    results.push(result);
  }

  const output = shouldOutputJson ? renderJson(results) : renderMarkdown(results);
  process.stdout.write(output);

  if (results.some((result) => result.status !== 'passed')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Failed to run diagnostics:', error);
  process.exitCode = 1;
});
