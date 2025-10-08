export type AgentType =
  | 'technical'
  | 'financial'
  | 'regulatory'
  | 'reporting'
  | 'risk'
  | 'planning'
  | 'general'

const KEYWORD_GROUPS: { type: AgentType; patterns: RegExp[] }[] = [
  {
    type: 'technical',
    patterns: [
      /t[ée]cnic[oa]/i,
      /infraestructura/i,
      /radiocomunicaciones?/i,
      /tecnolog[ií]a/i,
      /ingenier[ií]a/i
    ]
  },
  {
    type: 'financial',
    patterns: [
      /financier[ao]/i,
      /contable/i,
      /presupuesto/i,
      /presupuestari[ao]/i,
      /tesorer[ií]a/i
    ]
  },
  {
    type: 'regulatory',
    patterns: [
      /licencias?/i,
      /permisos?/i,
      /regulatori[oa]/i,
      /normativa/i,
      /expediente/i
    ]
  },
  {
    type: 'reporting',
    patterns: [
      /informes?/i,
      /reportes?/i,
      /tablero/i,
      /dashboard/i,
      /resumen/i,
      /ejecutivo/i
    ]
  },
  {
    type: 'risk',
    patterns: [/riesgos?/i, /auditor[ií]a/i, /alerta/i]
  },
  {
    type: 'planning',
    patterns: [
      /planificaci[oó]n/i,
      /planificador/i,
      /proyectos?/i,
      /estrat[ée]gic[oa]/i,
      /planeamiento/i
    ]
  }
]

export function inferAgentType(name: string): AgentType {
  for (const group of KEYWORD_GROUPS) {
    if (group.patterns.some((pattern) => pattern.test(name))) {
      return group.type
    }
  }

  return 'general'
}
