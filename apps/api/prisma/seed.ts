import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const agents = [
    { name: 'Analista Técnico', type: 'Analyst', area: 'Infraestructura y Radiocomunicaciones' },
    { name: 'Analista Financiero', type: 'Analyst', area: 'Gestión Presupuestaria' },
    { name: 'Analista Contable', type: 'Analyst', area: 'Contabilidad y Tesorería' },
    { name: 'Analista de Licencias', type: 'Analyst', area: 'Gestión de Licencias y Autorizaciones' },
    { name: 'Analista de Mercado', type: 'Analyst', area: 'Economía y Competencia' },
    { name: 'Analista de Riesgo', type: 'Analyst', area: 'Auditoría Interna' },
    { name: 'Analista de Datos', type: 'Analyst', area: 'Tecnologías de la Información' },
    { name: 'Analista Estratégico', type: 'Analyst', area: 'Planeamiento y Regulación' },
    { name: 'Generador de Informes', type: 'Report', area: 'Dirección General' },
    { name: 'Reporte de Análisis Técnico', type: 'Report', area: 'Laboratorio y Control Técnico' },
    { name: 'Reporte de Auditoría', type: 'Report', area: 'Auditoría y Control de Gestión' },
    { name: 'Reporte Económico', type: 'Report', area: 'Economía y Tarifas' },
    { name: 'Reporte de Licencias', type: 'Report', area: 'Dirección Nacional de Servicios TIC' },
    { name: 'Informe Ejecutivo', type: 'Report', area: 'Presidencia del ENACOM' },
    { name: 'Informe Trimestral', type: 'Report', area: 'Planeamiento Institucional' }
  ]

  for (const a of agents) {
    await prisma.agent.create({
      data: {
        ...a,
        uses: Math.floor(Math.random() * 400),
        downloads: Math.floor(Math.random() * 150),
        rewards: Math.floor(Math.random() * 25),
        stars: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        votes: Math.floor(Math.random() * 80)
      }
    })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
