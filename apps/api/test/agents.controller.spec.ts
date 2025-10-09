import { Test, TestingModule } from '@nestjs/testing'
import { AgentsController } from '../src/agents/agents.controller'
import { AgentsService } from '../src/agents/agents.service'
import { PrismaService } from '../src/prisma/prisma.service'

describe('AgentsController', () => {
  let controller: AgentsController

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgentsController],
      providers: [AgentsService, PrismaService]
    }).compile()

    controller = module.get<AgentsController>(AgentsController)
  })

  it('should return all agents', async () => {
    const result = await controller.getAll()
    expect(result).toBeDefined()
  })
})
