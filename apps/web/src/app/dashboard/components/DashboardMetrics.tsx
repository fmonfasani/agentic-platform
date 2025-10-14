'use client'

import { Users, Zap, Download, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Stat } from '@/components/ui/Stat'

import { DashboardMetrics as DashboardMetricsData } from '../hooks/useDashboardData'

type DashboardMetricsProps = {
  metrics: DashboardMetricsData
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  const { totals, areas } = metrics
  const qualityValue = `${(totals.globalAvgGrade * 100).toFixed(0)}%`

  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Agentes Activos" value={totals.totalAgents} icon={Users} trend="neutral" />
        <Stat label="Ejecuciones Totales" value={totals.totalUses} icon={Zap} trend="up" />
        <Stat label="Descargas" value={totals.totalDownloads} icon={Download} trend="up" />
        <Stat label="Calidad Promedio" value={qualityValue} icon={TrendingUp} trend="up" />
      </div>

      {!!areas.length && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-100">Desempeño por Área</h2>
            <p className="text-sm text-slate-400">Métricas clave por área funcional</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {areas.map((area) => (
              <Card key={area.area} hover>
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-100">{area.area}</h3>
                    <Badge variant="default">{area.agentCount} agentes</Badge>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <MetricRow label="Calidad" value={`${(area.avgGrade * 100).toFixed(0)}%`} />
                  <MetricRow label="Recompensas" value={area.totalRewards.toString()} />
                  <MetricRow label="Usos" value={area.totalUses.toString()} />
                  <MetricRow label="Descargas" value={area.totalDownloads.toString()} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

type MetricRowProps = {
  label: string
  value: string
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-200">{value}</span>
    </div>
  )
}

export default DashboardMetrics
