export type AgentType =
  | 'technical'
  | 'financial'
  | 'regulatory'
  | 'reporting'
  | 'risk'
  | 'planning'
  | 'general'

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
  },
  risk: {
    title: 'Gestión de Riesgos y Control',
    description:
      'Herramientas que monitorean riesgos operativos, alertas tempranas y mecanismos de control interno del ENACOM.'
  },
  planning: {
    title: 'Planificación y Proyectos Estratégicos',
    description:
      'Agentes que coordinan la planificación, seguimiento de proyectos y evaluación de impacto de las iniciativas institucionales.'
  },
  general: {
    title: 'Agentes Institucionales Generales',
    description:
      'Asistentes transversales que brindan soporte integral para diversas áreas y necesidades del organismo.'
  }
}

export const orderedAgentTypes: AgentType[] = [
  'technical',
  'financial',
  'regulatory',
  'reporting',
  'risk',
  'planning',
  'general'
]
