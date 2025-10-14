export type AgentRanking = {
  id: string
  name: string
  area: string | null
  rewards: number
  uses: number
  downloads: number
  avgGrade: number
  totalTraces: number
}

export type AreaSummary = {
  area: string
  agentCount: number
  avgGrade: number
  totalRewards: number
  totalUses: number
  totalDownloads: number
}

export type LeaderboardResponse = {
  leaderboard: AgentRanking[]
  areas: AreaSummary[]
}

export async function fetchDashboardLeaderboard(): Promise<LeaderboardResponse> {
  const response = await fetch('/api/dashboard/leaderboard')
  if (!response.ok) {
    throw new Error('Error al obtener los datos del dashboard')
  }
  return response.json()
}
