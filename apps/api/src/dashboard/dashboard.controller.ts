import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type LeaderboardEntry = {
  id: string
  name: string
  area: string | null
  rewards: number
  uses: number
  downloads: number
  avgGrade: number
  totalTraces: number
}

type AreaSummary = {
  area: string
  agentCount: number
  avgGrade: number
  totalRewards: number
  totalUses: number
  totalDownloads: number
}

@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    const agents = await this.prisma.agent.findMany({
      include: {
        traces: true,
      },
    })

    const leaderboard: LeaderboardEntry[] = agents.map((agent) => {
      const totalTraces = agent.traces.length
      const totalGrade = agent.traces.reduce((sum, trace) => sum + (trace.grade ?? 0), 0)
      const avgGrade = totalTraces > 0 ? totalGrade / totalTraces : 0

      return {
        id: agent.id,
        name: agent.name,
        area: agent.area,
        rewards: agent.rewards,
        uses: agent.uses,
        downloads: agent.downloads,
        avgGrade: Number(avgGrade.toFixed(2)),
        totalTraces,
      }
    })

    const areaAggregations = agents.reduce<
      Record<
        string,
        {
          area: string
          agentCount: number
          totalRewards: number
          totalUses: number
          totalDownloads: number
          totalGrade: number
          totalTraces: number
        }
      >
    >((acc, agent) => {
      const areaKey = agent.area?.toLowerCase() ?? 'sin área'
      const target = acc[areaKey] ?? {
        area: agent.area ?? 'Sin área',
        agentCount: 0,
        totalRewards: 0,
        totalUses: 0,
        totalDownloads: 0,
        totalGrade: 0,
        totalTraces: 0,
      }

      const totalGrade = agent.traces.reduce((sum, trace) => sum + (trace.grade ?? 0), 0)

      target.agentCount += 1
      target.totalRewards += agent.rewards
      target.totalUses += agent.uses
      target.totalDownloads += agent.downloads
      target.totalGrade += totalGrade
      target.totalTraces += agent.traces.length

      acc[areaKey] = target
      return acc
    }, {})

    const areaSummaries: AreaSummary[] = Object.values(areaAggregations)
      .map((area) => ({
        area: area.area,
        agentCount: area.agentCount,
        avgGrade: Number((area.totalTraces > 0 ? area.totalGrade / area.totalTraces : 0).toFixed(2)),
        totalRewards: area.totalRewards,
        totalUses: area.totalUses,
        totalDownloads: area.totalDownloads,
      }))
      .sort((a, b) => b.avgGrade - a.avgGrade || b.totalRewards - a.totalRewards)

    const sortedLeaderboard = [...leaderboard].sort(
      (a, b) => b.avgGrade - a.avgGrade || b.rewards - a.rewards
    )

    return {
      leaderboard: sortedLeaderboard,
      areas: areaSummaries,
    }
  }
}
