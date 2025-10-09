import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('DashboardController (e2e)', () => {
  let app: INestApplication

  const mockAgents = [
    {
      id: 'agent-1',
      name: 'Agente Técnico 1',
      area: 'Técnico',
      rewards: 10,
      uses: 5,
      downloads: 3,
      traces: [
        { grade: 0.8 },
        { grade: 0.9 },
      ],
    },
    {
      id: 'agent-2',
      name: 'Agente Técnico 2',
      area: 'Técnico',
      rewards: 6,
      uses: 4,
      downloads: 2,
      traces: [{ grade: 1 }],
    },
    {
      id: 'agent-3',
      name: 'Agente Financiero',
      area: 'Financiero',
      rewards: 4,
      uses: 2,
      downloads: 1,
      traces: [],
    },
    {
      id: 'agent-4',
      name: 'Agente Sin Área',
      area: null,
      rewards: 8,
      uses: 3,
      downloads: 2,
      traces: [{ grade: null }],
    },
  ]

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        agent: {
          findMany: jest.fn().mockResolvedValue(mockAgents),
        },
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/dashboard/areas (GET) should return grouped metrics with averages', async () => {
    const res = await request(app.getHttpServer()).get('/dashboard/areas').expect(200)

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          area: 'Técnico',
          totalAgents: 2,
          avgGrade: 0.93,
          avgRewards: 8,
          totalUses: 9,
          totalDownloads: 5,
          totalTraces: 3,
        }),
        expect.objectContaining({
          area: 'Financiero',
          totalAgents: 1,
          avgGrade: 0,
          avgRewards: 4,
          totalUses: 2,
          totalDownloads: 1,
          totalTraces: 0,
        }),
        expect.objectContaining({
          area: 'Sin área',
          totalAgents: 1,
          avgGrade: 0,
          avgRewards: 8,
          totalUses: 3,
          totalDownloads: 2,
          totalTraces: 1,
        }),
      ])
    )
  })

  it('/dashboard/leaderboard (GET) should include leaderboard and area summaries', async () => {
    const res = await request(app.getHttpServer()).get('/dashboard/leaderboard').expect(200)

    expect(res.body).toHaveProperty('leaderboard')
    expect(res.body).toHaveProperty('areas')

    expect(res.body.leaderboard).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'agent-1',
          name: 'Agente Técnico 1',
          area: 'Técnico',
          rewards: 10,
          uses: 5,
          downloads: 3,
          avgGrade: 0.85,
          totalTraces: 2,
        }),
        expect.objectContaining({
          id: 'agent-2',
          avgGrade: 1,
        }),
      ])
    )

    expect(res.body.areas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          area: 'Técnico',
          agentCount: 2,
          avgGrade: 0.93,
          totalRewards: 16,
          totalUses: 9,
          totalDownloads: 5,
        }),
        expect.objectContaining({
          area: 'Sin área',
          agentCount: 1,
          avgGrade: 0,
          totalRewards: 8,
          totalUses: 3,
          totalDownloads: 2,
        }),
      ])
    )
  })

  afterAll(async () => {
    await app.close()
  })
})
