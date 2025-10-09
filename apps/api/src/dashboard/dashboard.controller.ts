import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type AreaAccumulator = {
  total: number
  rewards: number
  uses: number
  downloads: number
  avgGrade: number
  traces: number
}

@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('areas')
  async getAreaMetrics() {
    const agents = await this.prisma.agent.findMany({
      include: { traces: true },
    })

    const grouped: Record<string, AreaAccumulator> = {}

    for (const agent of agents) {
      const area = agent.area || 'Sin área'
      if (!grouped[area]) {
        grouped[area] = {
          total: 0,
          rewards: 0,
          uses: 0,
          downloads: 0,
          avgGrade: 0,
          traces: 0,
        }
      }

      grouped[area].total += 1
      grouped[area].rewards += agent.rewards
      grouped[area].uses += agent.uses
      grouped[area].downloads += agent.downloads

      const grade =
        agent.traces.length > 0
          ? agent.traces.reduce((sum, trace) => sum + (trace.grade ?? 0), 0) / agent.traces.length
          : 0

      grouped[area].avgGrade += grade
      grouped[area].traces += agent.traces.length
    }

    const result = Object.entries(grouped).map(([area, data]) => ({
      area,
      totalAgents: data.total,
      avgGrade: Number((data.avgGrade / data.total).toFixed(2)),
      avgRewards: Math.round(data.rewards / data.total),
      totalUses: data.uses,
      totalDownloads: data.downloads,
      totalTraces: data.traces,
    }))

    return result.sort((a, b) => b.avgGrade - a.avgGrade)
  }
}
