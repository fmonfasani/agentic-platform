#!/usr/bin/env node
const { join } = require('path');
const { existsSync } = require('fs');
const { spawnSync } = require('child_process');

const binName = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const prismaBinary = join(process.cwd(), 'node_modules', '.bin', binName);

if (!existsSync(prismaBinary)) {
  console.log('Prisma CLI not found; skipping `prisma generate`.');
  process.exit(0);
}

const result = spawnSync(prismaBinary, ['generate'], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);
