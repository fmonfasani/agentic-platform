import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type AgentTraceSummary = { grade: number | null }

type AgentWithTraces = {
  id: string
  name: string
  area: string | null
  rewards: number
  uses: number
  downloads: number
  traces: AgentTraceSummary[]
}

type AreaAccumulator = {
  agents: number
  rewards: number
  uses: number
  downloads: number
  avgGradeSum: number
  traces: number
}

type AggregatedAreas = {
  metrics: {
    area: string
    totalAgents: number
    avgGrade: number
    avgRewards: number
    totalUses: number
    totalDownloads: number
    totalTraces: number
  }[]
  summaries: {
    area: string
    agentCount: number
    avgGrade: number
    totalRewards: number
    totalUses: number
    totalDownloads: number
  }[]
}

@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('areas')
  async getAreaMetrics() {
    const agents = await this.prisma.agent.findMany({
      include: { traces: true },
    })

    const { metrics } = this.aggregateAreas(agents)

    return metrics
  }

  @Get('leaderboard')
  async getLeaderboard() {
    const agents = await this.prisma.agent.findMany({
      include: { traces: true },
    })

    const leaderboard = agents
      .map((agent) => {
        const avgGrade = this.calculateAverageGrade(agent.traces)
        return {
          id: agent.id,
          name: agent.name,
          area: agent.area,
          rewards: agent.rewards,
          uses: agent.uses,
          downloads: agent.downloads,
          avgGrade: Number(avgGrade.toFixed(2)),
          totalTraces: agent.traces.length,
        }
      })
      .sort((a, b) => b.avgGrade - a.avgGrade)

    const { summaries } = this.aggregateAreas(agents)

    return {
      leaderboard,
      areas: summaries,
    }
  }

  private aggregateAreas(agents: AgentWithTraces[]): AggregatedAreas {
    const grouped = new Map<string, AreaAccumulator>()

    for (const agent of agents) {
      const area = agent.area ?? 'Sin área'
      if (!grouped.has(area)) {
        grouped.set(area, {
          agents: 0,
          rewards: 0,
          uses: 0,
          downloads: 0,
          avgGradeSum: 0,
          traces: 0,
        })
      }

      const accumulator = grouped.get(area)!
      accumulator.agents += 1
      accumulator.rewards += agent.rewards
      accumulator.uses += agent.uses
      accumulator.downloads += agent.downloads
      accumulator.traces += agent.traces.length

      const grade = this.calculateAverageGrade(agent.traces)
      accumulator.avgGradeSum += grade
    }

    const metrics = Array.from(grouped.entries())
      .map(([area, data]) => ({
        area,
        totalAgents: data.agents,
        avgGrade:
          data.agents > 0 ? Number((data.avgGradeSum / data.agents).toFixed(2)) : 0,
        avgRewards: data.agents > 0 ? Math.round(data.rewards / data.agents) : 0,
        totalUses: data.uses,
        totalDownloads: data.downloads,
        totalTraces: data.traces,
      }))
      .sort((a, b) => b.avgGrade - a.avgGrade)

    const summaries = Array.from(grouped.entries())
      .map(([area, data]) => ({
        area,
        agentCount: data.agents,
        avgGrade:
          data.agents > 0 ? Number((data.avgGradeSum / data.agents).toFixed(2)) : 0,
        totalRewards: data.rewards,
        totalUses: data.uses,
        totalDownloads: data.downloads,
      }))
      .sort((a, b) => b.avgGrade - a.avgGrade)

    return { metrics, summaries }
  }

  private calculateAverageGrade(traces: AgentTraceSummary[]): number {
    if (!traces.length) {
      return 0
    }

    const sum = traces.reduce((acc, trace) => acc + (trace.grade ?? 0), 0)
    return sum / traces.length
  }
}
