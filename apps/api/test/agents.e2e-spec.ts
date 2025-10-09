import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { AgentRunnerService } from '../src/agents/agent-runner.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AgentRunController (e2e)', () => {
  let app: INestApplication
  const runnerService: Pick<AgentRunnerService, 'run' | 'listTraces'> = {
    run: jest.fn(),
    listTraces: jest.fn()
  }

  const prismaMock: Partial<PrismaService> = {
    agent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    } as any,
    agentTrace: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    } as any
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(AgentRunnerService)
      .useValue(runnerService)
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /agents/:id/run should delegate to AgentRunnerService', async () => {
    const responsePayload = {
      runId: 'run-123',
      status: 'completed'
    }
    ;(runnerService.run as jest.Mock).mockResolvedValueOnce(responsePayload)

    const res = await request(app.getHttpServer())
      .post('/agents/agent-1/run')
      .send({ input: 'hola' })
      .expect(201)

    expect(runnerService.run).toHaveBeenCalledWith('agent-1', { input: 'hola' })
    expect(res.body).toMatchObject(responsePayload)
  })

  it('GET /agents/:id/traces should return trace summaries from AgentRunnerService', async () => {
    const traces = [{ id: 'trace-1' }]
    ;(runnerService.listTraces as jest.Mock).mockResolvedValueOnce(traces)

    const res = await request(app.getHttpServer())
      .get('/agents/agent-1/traces?take=5')
      .expect(200)

    expect(runnerService.listTraces).toHaveBeenCalledWith('agent-1', 5)
    expect(res.body).toEqual(traces)
  })
})
