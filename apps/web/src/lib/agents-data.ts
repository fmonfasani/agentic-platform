export type AgentType = 'Analyst' | 'Report'

export const agentGroups: Record<AgentType, { title: string; description: string }> = {
  Analyst: {
    title: 'Analistas Especializados',
    description:
      'Expertos del ENACOM en infraestructura, licencias, economía y planeamiento estratégico que impulsan la toma de decisiones.'
  },
  Report: {
    title: 'Reportes e Informes Institucionales',
    description:
      'Documentos y tableros ejecutivos que consolidan hallazgos regulatorios, técnicos y financieros para la gestión pública.'
  }
}

export const orderedAgentTypes: AgentType[] = ['Analyst', 'Report']
