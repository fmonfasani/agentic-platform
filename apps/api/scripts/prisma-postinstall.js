#!/usr/bin/env node
const { spawnSync } = require('child_process');
const runner = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(runner, ['prisma', 'generate'], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
