import { Test, TestingModule } from '@nestjs/testing'
import { AgentsService } from '../src/agents/agents.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AgentsService', () => {
  let service: AgentsService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentsService, PrismaService]
    }).compile()

    service = module.get<AgentsService>(AgentsService)
  })

  it('should list agents', async () => {
    const agents = await service.findAll()
    expect(Array.isArray(agents)).toBe(true)
  })

  it('should fetch one agent by ID', async () => {
    const all = await service.findAll()
    if (all.length > 0) {
      const agent = await service.findOne(all[0].id)
      expect(agent).toHaveProperty('id')
    }
  })
})
