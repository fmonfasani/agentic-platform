'use client'

import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type AreaMetrics = {
  area: string
  totalAgents: number
  avgGrade: number
  avgRewards: number
  totalUses: number
  totalDownloads: number
  totalTraces: number
}

export default function AreasDashboardPage() {
  const [data, setData] = useState<AreaMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const res = await fetch('http://localhost:3001/dashboard/areas')
      const json = await res.json()
      setData(json)
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) return <div className="text-white/70 p-6">Cargando métricas por área...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white/90 mb-2">Desempeño por Área — ENACOM</h1>
      <p className="text-white/60 mb-6">Análisis de calidad, recompensas y actividad de agentes por área.</p>

      <div className="h-80 bg-[#0f1928] rounded-xl p-4 mb-8 border border-white/10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="area" stroke="#888" />
            <YAxis domain={[0, 1]} stroke="#888" />
            <Tooltip />
            <Line type="monotone" dataKey="avgGrade" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-left text-sm uppercase text-white/60">
            <th className="p-3">Área</th>
            <th className="p-3">Agentes</th>
            <th className="p-3">Calidad Prom.</th>
            <th className="p-3">Recompensas</th>
            <th className="p-3">Usos</th>
            <th className="p-3">Descargas</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.area} className="border-b border-white/5 text-white/80">
              <td className="p-3 font-medium">{d.area}</td>
              <td className="p-3">{d.totalAgents}</td>
              <td className="p-3">{d.avgGrade.toFixed(2)}</td>
              <td className="p-3">{d.avgRewards}</td>
              <td className="p-3">{d.totalUses}</td>
              <td className="p-3">{d.totalDownloads}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
