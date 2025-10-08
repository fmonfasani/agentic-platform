import { PrismaClient } from '@prisma/client'
import { AgentType, inferAgentType } from '../src/agents/agent-type'

type AgentSeed = {
  id: string
  name: string
  area: string
  description: string
  type?: AgentType
  workflows: {
    id: string
    name: string
    status?: string
    model?: string
    platform?: string
  }[]
}

const prisma = new PrismaClient()

const agentsData: AgentSeed[] = [
  {
    id: '9b8d4331-1fc3-4cbe-a595-d02fa7c75f4b',
    name: 'Analista Técnico',
    area: 'Infraestructura y Radiocomunicaciones',
    description:
      'Supervisa la infraestructura técnica y coordina tareas de radiocomunicaciones para garantizar la cobertura nacional.',
    workflows: [
      {
        id: 'wf-analista-tecnico-1',
        name: 'Control de Espectro Radioeléctrico',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-analista-tecnico-2',
        name: 'Diagnóstico de Equipamiento',
        status: 'draft',
        model: 'gpt-4o-mini',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '1a9efb77-02cc-49db-bc0e-7cf9e19dd5c1',
    name: 'Analista Financiero',
    area: 'Gestión Presupuestaria',
    description:
      'Administra proyecciones financieras y seguimiento presupuestario para programas estratégicos del ENACOM.',
    workflows: [
      {
        id: 'wf-analista-financiero-1',
        name: 'Evaluación Presupuestaria Anual',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '1f513802-7560-4067-a3dd-90c50758a76d',
    name: 'Analista Contable',
    area: 'Contabilidad y Tesorería',
    description:
      'Genera estados contables y consolida información financiera para auditorías internas y externas.',
    workflows: [
      {
        id: 'wf-analista-contable-1',
        name: 'Conciliación de Estados Contables',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-analista-contable-2',
        name: 'Control de Ejecución Mensual',
        status: 'running',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '9d89184f-e36f-4cb8-9f5c-3a700ec367eb',
    name: 'Analista de Licencias',
    area: 'Gestión de Licencias y Autorizaciones',
    description: 'Evalúa solicitudes de licencias TIC y asesora a los actores en el cumplimiento regulatorio.',
    workflows: [
      {
        id: 'wf-analista-licencias-1',
        name: 'Evaluación de Expedientes TIC',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: 'c582e126-b417-4f36-8f13-9c7849f86603',
    name: 'Analista de Mercado',
    area: 'Economía y Competencia',
    description: 'Monitorea precios, oferta y demanda del mercado TIC para detectar oportunidades regulatorias.',
    workflows: [
      {
        id: 'wf-analista-mercado-1',
        name: 'Monitoreo de Competencia Regional',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-analista-mercado-2',
        name: 'Informe de Tendencias Tarifarias',
        status: 'ready',
        model: 'gpt-4o-mini',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '3f65cccb-3d2b-4c38-b81b-f55f1dd95b54',
    name: 'Analista de Riesgo',
    area: 'Auditoría Interna',
    description: 'Identifica riesgos operativos y sugiere medidas de mitigación en los procesos críticos del organismo.',
    workflows: [
      {
        id: 'wf-analista-riesgo-1',
        name: 'Mapa de Riesgos Operativos',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '68dd8e4f-3e9f-4a67-9d8b-2d7be6ab2b31',
    name: 'Analista de Datos',
    area: 'Tecnologías de la Información',
    description: 'Integra fuentes de datos del sector para proveer tableros y métricas estratégicas.',
    workflows: [
      {
        id: 'wf-analista-datos-1',
        name: 'Pipeline de Integración TIC',
        status: 'running',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-analista-datos-2',
        name: 'Análisis de Calidad de Datos',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: 'e550cc53-b5c5-4a36-a28c-71967e469540',
    name: 'Analista Estratégico',
    area: 'Planeamiento y Regulación',
    description: 'Evalúa y ejecuta análisis estratégicos para ENACOM',
    workflows: [
      {
        id: 'wf-001',
        name: 'Evaluar Política de Telecomunicaciones',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-analista-estrategico-2',
        name: 'Escenarios de Cobertura Digital',
        status: 'ready',
        model: 'gpt-4o-mini',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '2c68640b-6b63-45bc-9adc-e689b9b9b09c',
    name: 'Generador de Informes',
    area: 'Dirección General',
    description: 'Automatiza la redacción de informes ejecutivos con datos actualizados y visualizaciones.',
    type: 'reporting',
    workflows: [
      {
        id: 'wf-generador-informes-1',
        name: 'Informe Ejecutivo Semanal',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '44bf8267-43b5-4d52-8f52-ecdb54bc3d56',
    name: 'Reporte de Análisis Técnico',
    area: 'Laboratorio y Control Técnico',
    description: 'Genera informes técnicos sobre mediciones y pruebas de laboratorios especializados.',
    type: 'reporting',
    workflows: [
      {
        id: 'wf-reporte-tecnico-1',
        name: 'Resumen de Ensayos de Laboratorio',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: 'c57a4a5d-4973-4d25-8321-4ca6d0c08266',
    name: 'Reporte de Auditoría',
    area: 'Auditoría y Control de Gestión',
    description: 'Consolida hallazgos de auditoría y produce planes de acción para áreas responsables.',
    type: 'risk',
    workflows: [
      {
        id: 'wf-reporte-auditoria-1',
        name: 'Plan de Acción Correctiva',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-reporte-auditoria-2',
        name: 'Resumen de Auditorías Regionales',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '4e98f598-31cb-4f71-8ee9-3fd083fdc090',
    name: 'Reporte Económico',
    area: 'Economía y Tarifas',
    description: 'Analiza indicadores macroeconómicos y su impacto en los servicios de telecomunicaciones.',
    type: 'financial',
    workflows: [
      {
        id: 'wf-reporte-economico-1',
        name: 'Indicadores Macroeconómicos TIC',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: 'a6ca79f3-02dc-4f92-94f1-589836dcad95',
    name: 'Reporte de Licencias',
    area: 'Dirección Nacional de Servicios TIC',
    description: 'Centraliza renovaciones y vencimientos de licencias, avisando a las áreas responsables.',
    type: 'regulatory',
    workflows: [
      {
        id: 'wf-reporte-licencias-1',
        name: 'Seguimiento de Renovaciones',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: 'abf50f16-3ae4-4c5b-86d0-7b30bf71f2d5',
    name: 'Informe Ejecutivo',
    area: 'Presidencia del ENACOM',
    description: 'Elabora presentaciones ejecutivas con foco en hitos y riesgos institucionales.',
    type: 'reporting',
    workflows: [
      {
        id: 'wf-informe-ejecutivo-1',
        name: 'Reporte de Hitos Mensuales',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      }
    ]
  },
  {
    id: '6a256abe-dc38-4f37-b046-09bb05f0e534',
    name: 'Informe Trimestral',
    area: 'Planeamiento Institucional',
    description: 'Compila resultados del trimestre para el directorio y las áreas de seguimiento.',
    type: 'reporting',
    workflows: [
      {
        id: 'wf-informe-trimestral-1',
        name: 'Reporte Integral Trimestral',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI'
      },
      {
        id: 'wf-informe-trimestral-2',
        name: 'Análisis Comparativo Interanual',
        status: 'ready',
        model: 'gpt-4o-mini',
        platform: 'OpenAI'
      }
    ]
  }
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  await prisma.workflow.deleteMany()
  await prisma.agentUsage.deleteMany()
  await prisma.agentTrace.deleteMany()
  await prisma.agent.deleteMany()

  for (const agent of agentsData) {
    const uses = randomInt(50, 250)
    const downloads = randomInt(25, 160)
    const rewards = randomInt(0, 12)
    const votes = randomInt(5, 80)
    const stars = Number((3.5 + Math.random() * 1.5).toFixed(1))

    await prisma.agent.create({
      data: {
        id: agent.id,
        name: agent.name,
        type: agent.type ?? inferAgentType(agent.name),
        area: agent.area,
        description: agent.description,
        uses,
        downloads,
        rewards,
        stars,
        votes,
        workflows: {
          create: agent.workflows
        }
      }
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
