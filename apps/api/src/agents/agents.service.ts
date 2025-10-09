import { Injectable, NotFoundException } from '@nestjs/common'
import { inferAgentType, AgentType } from './agent-type'
import { PrismaService } from '../prisma/prisma.service'

type AgentCreateArgs = Parameters<
  PrismaService['prototype']['agent']['create']
>[0]

type AgentCreateData = AgentCreateArgs extends { data: infer T }
  ? T
  : AgentCreateArgs

const AGENT_SUMMARY_SELECT = {
  id: true,
  name: true,
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

type AgentSummaryRow = {
  id: string
  name: string
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

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agent.findMany({
      include: { workflows: true, traces: true }
    })
  }

  async findOne(id: string) {
    return this.prisma.agent.findUnique({
      where: { id },
      include: { workflows: true, traces: true }
    })
  }

  async create(data: AgentCreateData) {
    return this.prisma.agent.create({ data })
  }

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
    metadata: Partial<Pick<AgentSummaryRow, 'openaiAgentId' | 'instructions' | 'model'>>
  ) {
    const agent = await this.prisma.agent.update({
      where: { id },
      data: metadata,
      select: AGENT_SUMMARY_SELECT
    })

    return agent
  }
}

