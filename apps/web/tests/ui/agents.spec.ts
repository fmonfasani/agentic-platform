import { test, expect } from '@playwright/test'

const API_BASE_URL = 'http://localhost:3001/api'

const agentSummary = {
  id: 'agente-001',
  name: 'Agente Federal de Datos',
  area: 'Operaciones Técnicas',
  description: 'Coordina auditorías de infraestructura y normaliza reportes estratégicos.',
  type: 'technical',
  uses: 128,
  downloads: 42,
  rewards: 12,
  stars: 4.6,
  votes: 85
}

const agentDetail = {
  id: agentSummary.id,
  name: agentSummary.name,
  area: agentSummary.area,
  description: 'Supervisa despliegues críticos para asegurar conectividad nacional.',
  model: 'gpt-4.1-mini',
  openaiAgentId: 'agent-kit-001',
  instructions: 'Mantener monitoreo constante sobre enlaces troncales.',
  updatedAt: '2024-09-10T12:00:00.000Z'
}

const agentMetrics = {
  accuracy: 0.92,
  averageResponseTime: 3.2,
  successRate: 0.88
}

const agentTraces = [
  {
    id: 'trace-001',
    status: 'COMPLETED',
    createdAt: '2024-09-10T12:30:00.000Z',
    summary: 'Validación de resiliencia de red finalizada con éxito.',
    grade: 0.95,
    evaluator: 'Auditor Automático'
  }
]

test.beforeEach(async ({ page }) => {
  await page.route(`${API_BASE_URL}/agents`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([agentSummary])
    })
  })

  await page.route(`${API_BASE_URL}/agents/${agentSummary.id}`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(agentDetail)
    })
  })

  await page.route(`${API_BASE_URL}/agents/${agentSummary.id}/metrics`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(agentMetrics)
    })
  })

  await page.route(new RegExp(`${API_BASE_URL}/agents/${agentSummary.id}/traces.*`), (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(agentTraces)
    })
  })
})

const gotoAgents = async (page: import('@playwright/test').Page) => {
  await page.goto('/agents')
  await expect(page.getByRole('heading', { name: 'Panel de Control ENACOM' })).toBeVisible()
}

test('muestra el panel de agentes en /agents', async ({ page }) => {
  await gotoAgents(page)

  const agentCard = page.getByRole('button', { name: /Agente Federal de Datos/ })
  await expect(agentCard).toBeVisible()
  await expect(agentCard.getByText('Usos')).toBeVisible()
  await expect(agentCard.getByText('128')).toBeVisible()
})

test('permite abrir el modal con doble clic y visualizar métricas', async ({ page }) => {
  await gotoAgents(page)

  const agentCard = page.getByRole('button', { name: /Agente Federal de Datos/ })
  await agentCard.dblclick()

  await expect(page.getByRole('heading', { name: 'Agente Federal de Datos', level: 2 })).toBeVisible()
  await expect(page.getByText('Precisión Operativa')).toBeVisible()
  await expect(page.getByText('92.0%')).toBeVisible()
  await expect(page.getByText('Tiempo Medio de Respuesta')).toBeVisible()
  await expect(page.getByText('3.2s')).toBeVisible()
})
