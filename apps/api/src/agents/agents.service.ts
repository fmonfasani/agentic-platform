import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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
} satisfies Prisma.AgentSelect

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
    metadata: Pick<Prisma.AgentUpdateInput, 'openaiAgentId' | 'instructions' | 'model'>
  ) {
    return this.prisma.agent.update({
      where: { id },
      data: metadata,
      select: AGENT_SUMMARY_SELECT
    })
  }
}

export type AgentSummary = Prisma.AgentGetPayload<{ select: typeof AGENT_SUMMARY_SELECT }>
