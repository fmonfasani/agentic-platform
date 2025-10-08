const REPORT_KEYWORDS = [/reporte/i, /informe/i, /generador de informes/i]

export type AgentType = 'Analyst' | 'Report'

export function inferAgentType(name: string): AgentType {
  return REPORT_KEYWORDS.some((pattern) => pattern.test(name)) ? 'Report' : 'Analyst'
}
