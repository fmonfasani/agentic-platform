import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/prisma/prisma.service'

describe('DashboardController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        agent: {
          findMany: jest.fn().mockResolvedValue([
            {
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
              area: 'Financiero',
              rewards: 4,
              uses: 2,
              downloads: 1,
              traces: [],
            },
          ]),
        },
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('/dashboard/areas (GET) should return grouped metrics', async () => {
    const res = await request(app.getHttpServer()).get('/dashboard/areas').expect(200)
    expect(Array.isArray(res.body)).toBeTruthy()
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('area')
      expect(res.body[0]).toHaveProperty('avgGrade')
    }
  })

  afterAll(async () => {
    await app.close()
  })
})
