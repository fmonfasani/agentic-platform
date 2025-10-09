import { INestApplication, Injectable } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'
import { mkdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { AgentRunnerService } from '../src/agents/agent-runner.service'
import { AgentTraceService } from '../src/agents/tracing/agent-trace.service'
import { AgentsService } from '../src/agents/agents.service'
import { PrismaService } from '../src/prisma/prisma.service'

jest.setTimeout(30000)

@Injectable()
class FakeAgentRunnerService {
  constructor(
    private readonly traceService: AgentTraceService,
    private readonly agentsService: AgentsService
  ) {}

  async run(agentId: string, payload: Parameters<AgentRunnerService['run']>[1]) {
    const agent = await this.agentsService.getAgent(agentId)

    const runId = `test-run-${Date.now()}`
    const userMessages = Array.isArray(payload?.messages) ? payload.messages : []
    const inputRecord =
      userMessages.length > 0
        ? userMessages
        : payload?.input
          ? [{ role: 'user', content: payload.input }]
          : null
    const transcript = [
      ...(inputRecord ? (Array.isArray(inputRecord) ? inputRecord : [inputRecord]) : []),
      { role: 'assistant', content: `Resultado simulado para ${agent.name}` }
    ]

    const created = await this.traceService.createTrace(agentId, runId, inputRecord)
    const completed = await this.traceService.completeTrace(created.id, {
      status: 'completed',
      output: transcript
    })

    return {
      runId,
      status: 'completed' as const,
      agentId,
      openaiAgentId: `stubbed-${agentId}`,
      message: transcript[transcript.length - 1]?.content ?? '',
      transcript,
      evaluation: null,
      trace: completed
    }
  }

  async listTraces(agentId: string, take = 20) {
    return this.traceService.listTracesForAgent(agentId, take)
  }
}

describe('Agents API Day 1 flows (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let server: any
  let databaseFile: string
  let previousDatabaseUrl: string | undefined
  let prismaClientReady = false

  const seedAgents = [
    {
      id: 'agent-analyst-1',
      name: 'Analista Técnico',
      area: 'Infraestructura y despliegues',
      description: 'Procesa informes técnicos',
      type: 'technical'
    },
    {
      id: 'agent-analyst-2',
      name: 'Analista Financiero',
      area: 'Presupuesto y contabilidad',
      description: 'Evalúa datos contables y presupuestarios',
      type: 'financial'
    },
    {
      id: 'agent-analyst-3',
      name: 'Analista de Licencias',
      area: 'Gestión de licencias',
      description: 'Controla los permisos y autorizaciones',
      type: 'regulatory'
    },
    {
      id: 'agent-analyst-4',
      name: 'Analista Estratégico',
      area: 'Planeamiento y regulación',
      description: 'Integra datos para reportes ejecutivos',
      type: 'strategic'
    }
  ]

  beforeAll(async () => {
    databaseFile = join(__dirname, 'tmp', `day1-${randomUUID()}.sqlite`)
    mkdirSync(dirname(databaseFile), { recursive: true })
    const databaseUrl = `file:${databaseFile}`
    previousDatabaseUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = databaseUrl

    if (!prismaClientReady) {
      execSync('pnpm --filter api exec prisma generate', {
        stdio: 'ignore',
        env: { ...process.env, DATABASE_URL: databaseUrl }
      })
      prismaClientReady = true
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(AgentRunnerService)
      .useClass(FakeAgentRunnerService)
      .compile()

    app = moduleFixture.createNestApplication()
    prisma = moduleFixture.get(PrismaService)

    await applySchema(prisma)
    await prisma.agent.deleteMany()
    await prisma.agent.createMany({
      data: seedAgents.map((agent) => ({
        ...agent,
        uses: 0,
        downloads: 0,
        rewards: 0,
        stars: 0,
        votes: 0
      }))
    })

    await app.init()
    server = app.getHttpServer()
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
    if (previousDatabaseUrl !== undefined) {
      process.env.DATABASE_URL = previousDatabaseUrl
    }
    try {
      rmSync(databaseFile, { force: true })
    } catch {
      // ignore cleanup errors
    }
  })

  it('GET /agents returns the seeded catalog', async () => {
    const response = await request(server).get('/agents').expect(200)

    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(4)
    response.body.forEach((agent: any) => {
      expect(agent).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          area: expect.any(String),
          traces: expect.any(Array),
          workflows: expect.any(Array)
        })
      )
    })
  })

  it('POST /agents/:id/run creates a trace and GET /agents/:id/traces returns it', async () => {
    const targetAgent = seedAgents[0]

    const runResponse = await request(server)
      .post(`/agents/${targetAgent.id}/run`)
      .send({ input: 'Revisión diaria de métricas' })
      .expect(201)

    expect(runResponse.body).toEqual(
      expect.objectContaining({
        agentId: targetAgent.id,
        status: 'completed',
        runId: expect.any(String),
        message: expect.stringContaining(targetAgent.name.split(' ')[0]),
        trace: expect.objectContaining({
          id: expect.any(String),
          agentId: targetAgent.id,
          status: 'completed',
          createdAt: expect.any(String),
          input: expect.anything(),
          output: expect.anything()
        })
      })
    )

    const tracesResponse = await request(server)
      .get(`/agents/${targetAgent.id}/traces`)
      .expect(200)

    expect(Array.isArray(tracesResponse.body)).toBe(true)
    expect(tracesResponse.body).toHaveLength(1)
    expect(tracesResponse.body[0]).toEqual(
      expect.objectContaining({
        agentId: targetAgent.id,
        runId: runResponse.body.runId,
        status: 'completed',
        input: expect.any(Array),
        output: expect.any(Array)
      })
    )
  })
})

async function applySchema(prisma: PrismaService) {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON')

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Agent" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'Analyst',
      "area" TEXT NOT NULL,
      "description" TEXT,
      "uses" INTEGER NOT NULL DEFAULT 0,
      "downloads" INTEGER NOT NULL DEFAULT 0,
      "rewards" INTEGER NOT NULL DEFAULT 0,
      "stars" REAL NOT NULL DEFAULT 0,
      "votes" INTEGER NOT NULL DEFAULT 0,
      "openaiAgentId" TEXT,
      "model" TEXT,
      "instructions" TEXT,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Workflow" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ready',
      "model" TEXT NOT NULL DEFAULT 'gpt-4o',
      "platform" TEXT NOT NULL DEFAULT 'OpenAI',
      "action" TEXT,
      "value" REAL,
      "agentId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Workflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AgentTrace" (
      "id" TEXT PRIMARY KEY,
      "agentId" TEXT NOT NULL,
      "runId" TEXT,
      "status" TEXT,
      "grade" REAL,
      "feedback" TEXT,
      "evaluator" TEXT,
      "traceUrl" TEXT,
      "input" TEXT,
      "output" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AgentTrace_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
}
