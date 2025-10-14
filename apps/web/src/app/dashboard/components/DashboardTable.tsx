'use client'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

import type { AgentRanking } from '@/lib/api/dashboard'

type DashboardTableProps = {
  agents: AgentRanking[]
  searchTerm: string
  onRowClick: (agent: AgentRanking) => void
}

const DashboardTable: React.FC<DashboardTableProps> = ({ agents, searchTerm, onRowClick }) => {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Ranking de Agentes</h2>
          <p className="text-sm text-slate-400">Ordenado por calidad promedio</p>
        </div>
        {searchTerm && (
          <p className="text-xs uppercase tracking-wider text-slate-500">{agents.length} resultado(s)</p>
        )}
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700 bg-slate-900/50">
              <tr>
                <Th>Agente</Th>
                <Th>Área</Th>
                <Th>Recompensas</Th>
                <Th>Usos</Th>
                <Th>Descargas</Th>
                <Th>Calidad</Th>
                <Th>Trazas</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {agents.map((agent, idx) => (
                <tr
                  key={agent.id}
                  onClick={() => onRowClick(agent)}
                  className="cursor-pointer transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-100">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{agent.area ?? 'Sin área'}</td>
                  <td className="px-6 py-4 text-slate-300">{agent.rewards}</td>
                  <td className="px-6 py-4 text-slate-300">{agent.uses}</td>
                  <td className="px-6 py-4 text-slate-300">{agent.downloads}</td>
                  <td className="px-6 py-4">
                    <Badge variant={agent.avgGrade >= 0.8 ? 'success' : agent.avgGrade >= 0.6 ? 'warning' : 'error'}>
                      {(agent.avgGrade * 100).toFixed(0)}%
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{agent.totalTraces}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

type ThProps = {
  children: React.ReactNode
}

const Th: React.FC<ThProps> = ({ children }) => {
  return <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</th>
}

export default DashboardTable
