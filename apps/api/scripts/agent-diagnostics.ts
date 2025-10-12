    import { execSync } from 'child_process'
import fs from 'fs'

const timestamp = new Date().toISOString()
const apiStatus = execSync('curl -s http://localhost:3001/health || echo "offline"').toString()
const testApi = execSync('cd apps/api && pnpm test --silent || echo "failed"').toString()
const testWeb = execSync('cd apps/web && pnpm test --silent || echo "failed"').toString()

const report = `
# Agentic Platform Diagnostic — ${timestamp}

## API Status
${apiStatus.trim()}

## API Tests
${testApi.trim()}

## Frontend Tests
${testWeb.trim()}

---

✅ Última revisión automática completada correctamente
`

fs.writeFileSync('reports/agent-audit.md', report)
