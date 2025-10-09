export type AgentType = 'technical' | 'financial' | 'regulatory' | 'reporting'

export const agentGroups: Record<AgentType, { title: string; description: string }> = {
  technical: {
    title: 'Operaciones Técnicas',
    description:
      'Agentes enfocados en infraestructura, radiocomunicaciones y soporte tecnológico crítico para garantizar la conectividad.'
  },
  financial: {
    title: 'Análisis Financiero y Contable',
    description:
      'Especialistas en presupuestos, ejecución financiera y auditorías que respaldan la sostenibilidad institucional.'
  },
  regulatory: {
    title: 'Gestión Regulatoria y Licencias',
    description:
      'Referentes que acompañan los procesos de licencias, autorizaciones y cumplimiento normativo del sector TIC.'
  },
  reporting: {
    title: 'Reportes e Informes Institucionales',
    description:
      'Documentos ejecutivos y tableros que consolidan hallazgos regulatorios, técnicos y financieros para la gestión pública.'
  }
}

export const orderedAgentTypes: AgentType[] = [
  'technical',
  'financial',
  'regulatory',
  'reporting'
]
