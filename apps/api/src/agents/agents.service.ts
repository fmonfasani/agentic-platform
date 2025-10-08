import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const AGENT_SUMMARY_SELECT = {
  id: true,
  name: true,
  type: true,
  area: true,
  uses: true,
  downloads: true,
  rewards: true,
  stars: true,
  votes: true,
  openaiAgentId: true,
  model: true,
  instructions: true
} as const

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  listAgents() {
    return this.prisma.agent.findMany({
      select: AGENT_SUMMARY_SELECT,
      orderBy: { name: 'asc' }
    })
  }

  async getAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      select: {
        ...AGENT_SUMMARY_SELECT,
        description: true,
        updatedAt: true,
        traces: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!agent) {
      throw new NotFoundException('Agent not found')
    }

    return agent
  }

  async updateAgentAgentKitMetadata(
    id: string,
    metadata: Partial<Pick<AgentSummary, 'openaiAgentId' | 'instructions' | 'model'>>
  ) {
    return this.prisma.agent.update({
      where: { id },
      data: metadata,
      select: AGENT_SUMMARY_SELECT
    })
  }
}

export type AgentSummary = {
  id: string
  name: string
  type: string
  area: string
  uses: number
  downloads: number
  rewards: number
  stars: number
  votes: number
  openaiAgentId: string | null
  model: string | null
  instructions: string | null
}
