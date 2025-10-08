import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const agents = [
  {
    id: 'ccf2987a-7710-4a75-b566-2e229bf6dc2e',
    name: 'Analista Contable',
    area: 'Contabilidad y Tesorería',
    description: 'Evalúa informes financieros y balances contables',
    stars: 4.8,
    votes: 74,
    metrics: { uses: 324, downloads: 152, rewards: 13 },
    workflows: [
      { name: 'Revisión de estados contables' },
      { name: 'Análisis de gastos trimestrales' }
    ]
  },
  {
    id: 'e550cc53-b5c5-4a36-a28c-71967e469540',
    name: 'Analista Estratégico',
    area: 'Planeamiento y Regulación',
    description: 'Evalúa y ejecuta análisis estratégicos para ENACOM',
    stars: 4.8,
    votes: 10,
    metrics: { uses: 196, downloads: 126, rewards: 1 },
    workflows: [{ name: 'Evaluar Política de Telecomunicaciones' }]
  },
  {
    id: '3b711bf4-7e2a-4a81-92cc-8e0ba36e89a6',
    name: 'Analista Técnico',
    area: 'Infraestructura y Radiocomunicaciones',
    description: 'Supervisa la infraestructura de redes y el uso del espectro radioeléctrico',
    stars: 4.7,
    votes: 58,
    metrics: { uses: 412, downloads: 189, rewards: 15 },
    workflows: [
      { name: 'Inspección de antenas regionales' },
      { name: 'Validación de cumplimiento espectral' }
    ]
  },
  {
    id: '98ef5847-8f70-41e5-a03b-1b83668c3fc9',
    name: 'Analista Financiero',
    area: 'Gestión Presupuestaria',
    description: 'Monitorea el presupuesto operativo y proyecciones financieras',
    stars: 4.6,
    votes: 63,
    metrics: { uses: 287, downloads: 134, rewards: 9 },
    workflows: [
      { name: 'Optimización de asignaciones presupuestarias' },
      { name: 'Proyección de flujo de caja institucional' }
    ]
  },
  {
    id: '027a4309-2d95-4b30-97cc-0a16b447f1fb',
    name: 'Analista de Licencias',
    area: 'Gestión de Licencias y Autorizaciones',
    description: 'Evalúa solicitudes y renovaciones de licencias de servicios TIC',
    stars: 4.5,
    votes: 41,
    metrics: { uses: 256, downloads: 118, rewards: 7 },
    workflows: [
      { name: 'Control de documentación regulatoria' },
      { name: 'Seguimiento de expedientes críticos' }
    ]
  },
  {
    id: '04b3b7d4-2f73-41d7-9fd2-80d56a82436f',
    name: 'Analista de Mercado',
    area: 'Economía y Competencia',
    description: 'Analiza tendencias de mercado y escenarios competitivos del sector',
    stars: 4.9,
    votes: 52,
    metrics: { uses: 344, downloads: 201, rewards: 19 },
    workflows: [
      { name: 'Reporte de participación de mercado' },
      { name: 'Simulación de impacto tarifario' }
    ]
  },
  {
    id: 'a05c53f0-9446-4c79-9d39-7a0f6d203b20',
    name: 'Analista de Riesgo',
    area: 'Auditoría Interna',
    description: 'Identifica riesgos operativos y de cumplimiento en procesos críticos',
    stars: 4.4,
    votes: 39,
    metrics: { uses: 198, downloads: 94, rewards: 6 },
    workflows: [
      { name: 'Mapa de riesgos institucionales' },
      { name: 'Plan de mitigación regulatoria' }
    ]
  },
  {
    id: 'b8f45f2f-6166-4a31-a053-984647fa829b',
    name: 'Analista de Datos',
    area: 'Tecnologías de la Información',
    description: 'Integra fuentes de datos y desarrolla tableros ejecutivos',
    stars: 4.9,
    votes: 81,
    metrics: { uses: 521, downloads: 309, rewards: 27 },
    workflows: [
      { name: 'Consolidación de datasets estratégicos' },
      { name: 'Generación de tablero ENACOM 360' }
    ]
  },
  {
    id: 'f3e2b7ce-71e0-4b75-b1c6-3ab6056ff34e',
    name: 'Generador de Informes',
    area: 'Dirección General',
    description: 'Compila información transversal para presentaciones institucionales',
    stars: 4.3,
    votes: 28,
    metrics: { uses: 142, downloads: 203, rewards: 8 },
    workflows: [
      { name: 'Informe ejecutivo semanal' },
      { name: 'Síntesis de indicadores críticos' }
    ]
  },
  {
    id: '5d2b36fd-04e4-4f42-9d6c-8f9d5c04005c',
    name: 'Reporte de Análisis Técnico',
    area: 'Laboratorio y Control Técnico',
    description: 'Genera reportes técnicos sobre mediciones e inspecciones de campo',
    stars: 4.6,
    votes: 32,
    metrics: { uses: 178, downloads: 241, rewards: 12 },
    workflows: [
      { name: 'Consolidado de mediciones radioeléctricas' }
    ]
  },
  {
    id: '95f2940f-6f6f-4f69-8728-a9a4e136d6fc',
    name: 'Reporte de Auditoría',
    area: 'Auditoría y Control de Gestión',
    description: 'Documenta hallazgos y recomendaciones de auditorías internas',
    stars: 4.5,
    votes: 46,
    metrics: { uses: 163, downloads: 227, rewards: 14 },
    workflows: [
      { name: 'Seguimiento de recomendaciones de auditoría' }
    ]
  },
  {
    id: '71590cb3-63f8-4c75-8e89-8c1268697bfa',
    name: 'Reporte Económico',
    area: 'Economía y Tarifas',
    description: 'Elabora reportes macroeconómicos y análisis tarifario',
    stars: 4.7,
    votes: 54,
    metrics: { uses: 205, downloads: 256, rewards: 16 },
    workflows: [
      { name: 'Informe de variaciones tarifarias' },
      { name: 'Monitoreo de indicadores macro' }
    ]
  },
  {
    id: 'c3a35165-5ba4-44a9-9614-17e6ae2c38a8',
    name: 'Reporte de Licencias',
    area: 'Dirección Nacional de Servicios TIC',
    description: 'Sistematiza el estado de licencias y autorizaciones vigentes',
    stars: 4.2,
    votes: 26,
    metrics: { uses: 149, downloads: 198, rewards: 5 },
    workflows: [
      { name: 'Panel de renovaciones pendientes' }
    ]
  },
  {
    id: 'fdf7d8f1-09e0-4f8b-91a2-0d3d1842e7b2',
    name: 'Informe Ejecutivo',
    area: 'Presidencia del ENACOM',
    description: 'Sintetiza avances clave y métricas de gestión para la presidencia',
    stars: 4.9,
    votes: 91,
    metrics: { uses: 367, downloads: 312, rewards: 24 },
    workflows: [
      { name: 'Briefing semanal para presidencia' },
      { name: 'Informe de hitos regulatorios' }
    ]
  },
  {
    id: 'e3a209ff-96d1-4b59-b0b9-8dd3cf1c2993',
    name: 'Informe Trimestral',
    area: 'Planeamiento Institucional',
    description: 'Compila resultados trimestrales y métricas estratégicas del organismo',
    stars: 4.6,
    votes: 47,
    metrics: { uses: 238, downloads: 284, rewards: 11 },
    workflows: [
      { name: 'Reporte de cumplimiento de KPIs' },
      { name: 'Resumen ejecutivo para directorio' }
    ]
  }
]

async function main() {
  await prisma.workflow.deleteMany()
  await prisma.metrics.deleteMany()
  await prisma.agent.deleteMany()

  for (const agent of agents) {
    await prisma.agent.create({
      data: {
        id: agent.id,
        name: agent.name,
        area: agent.area,
        description: agent.description,
        stars: agent.stars,
        votes: agent.votes,
        metrics: { create: agent.metrics },
        workflows: { create: agent.workflows }
      }
    })
  }
}

main()
  .then(() => console.log('Seed completo ✅'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
