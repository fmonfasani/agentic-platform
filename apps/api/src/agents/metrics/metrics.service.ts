import { Injectable, NotFoundException } from '@nestjs/common'
import { inferAgentType, AgentType } from '../agent-type'
import { PrismaService } from '../../prisma/prisma.service'

type MetricField = 'uses' | 'downloads' | 'rewards'

const ACTION_MAP: Record<MetricField, 'use' | 'download' | 'reward'> = {
  uses: 'use',
  downloads: 'download',
  rewards: 'reward'
}

const METRIC_SELECT = {
  id: true,
  name: true,
  area: true,
  uses: true,
  downloads: true,
  rewards: true,
  stars: true,
  votes: true
}

const addAgentType = <T extends { name: string }>(agent: T): T & { type: AgentType } => ({
  ...agent,
  type: inferAgentType(agent.name)
})

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async increment(id: string, field: MetricField) {
    const action = ACTION_MAP[field]

    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        [field]: { increment: 1 },
        usages: {
          create: {
            action
          }
        }
      },
      select: METRIC_SELECT
    })

    return addAgentType(agent)
  }

  async rate(id: string, stars: number) {
    const agent = await this.prisma.agent.findUnique({ where: { id } })
    if (!agent) {
      throw new NotFoundException('Agent not found')
    }

    const safeStars = Math.max(0, Math.min(5, stars))
    const calculatedAverage = agent.votes === 0 ? safeStars : (agent.stars * agent.votes + safeStars) / (agent.votes + 1)
    const newAverage = Number(calculatedAverage.toFixed(2))

    const updated = await this.prisma.agent.update({
      where: { id },
      data: {
        stars: newAverage,
        votes: { increment: 1 },
        usages: {
          create: {
            action: 'rate',
            value: safeStars
          }
        }
      },
      select: METRIC_SELECT
    })

    return addAgentType(updated)
  }

  async getMetrics(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      select: METRIC_SELECT
    })

    return agent ? addAgentType(agent) : null
  }

}
