import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

type MetricField = 'uses' | 'downloads' | 'rewards'

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

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async increment(id: string, field: MetricField) {
    const agent = await this.prisma.agent.update({
      where: { id },
      data: {
        [field]: { increment: 1 }
      },
      select: METRIC_SELECT
    })

    return agent
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
        votes: { increment: 1 }
      },
      select: METRIC_SELECT
    })

    return updated
  }

  async getMetrics(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      select: METRIC_SELECT
    })

    return agent
  }

}
