
#!/usr/bin/env node
const { spawnSync } = require('child_process');
const runner = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(runner, ['prisma', 'generate'], { stdio: 'inherit' });

if (result.error) {
  console.error(result.error);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 0);

const { execSync } = require("child_process");

console.log("🧩 Running Prisma generate...");
try {
  execSync("npx prisma generate", { stdio: "inherit", shell: true });
  console.log("✅ Prisma client generated successfully!");
} catch (e) {
  console.error("❌ Prisma generate failed:", e.message);
  process.exit(1);
}
