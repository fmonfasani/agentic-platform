import { useMemo } from 'react'
import useSWR, { KeyedMutator } from 'swr'

import {
  type AgentRanking,
  type AreaSummary,
  type LeaderboardResponse,
  fetchDashboardLeaderboard
} from '@/lib/api/dashboard'

export type DashboardTotals = {
  totalRewards: number
  totalUses: number
  totalDownloads: number
  totalAgents: number
  globalAvgGrade: number
}

export type DashboardMetrics = {
  totals: DashboardTotals
  areas: AreaSummary[]
}

export type UseDashboardDataResult = {
  metrics: DashboardMetrics
  leaderboard: AgentRanking[]
  isLoading: boolean
  error: unknown
  reload: KeyedMutator<LeaderboardResponse>
}

const fetcher = () => fetchDashboardLeaderboard()

export function useDashboardData(): UseDashboardDataResult {
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    'dashboard-leaderboard',
    fetcher,
    {
      revalidateOnFocus: false
    }
  )

  const metrics = useMemo<DashboardMetrics>(() => {
    const leaderboard = data?.leaderboard ?? []
    const totals = leaderboard.reduce(
      (acc, agent) => {
        acc.totalRewards += agent.rewards
        acc.totalUses += agent.uses
        acc.totalDownloads += agent.downloads
        acc.totalAgents += 1
        acc.globalAvgGrade += agent.avgGrade
        return acc
      },
      { totalRewards: 0, totalUses: 0, totalDownloads: 0, totalAgents: 0, globalAvgGrade: 0 }
    )

    const globalAvgGrade = totals.totalAgents > 0 ? totals.globalAvgGrade / totals.totalAgents : 0

    return {
      totals: {
        totalRewards: totals.totalRewards,
        totalUses: totals.totalUses,
        totalDownloads: totals.totalDownloads,
        totalAgents: totals.totalAgents,
        globalAvgGrade
      },
      areas: data?.areas ?? []
    }
  }, [data])

  return {
    metrics,
    leaderboard: data?.leaderboard ?? [],
    isLoading,
    error,
    reload: mutate
  }
}
