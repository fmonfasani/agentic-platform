export type Agent = { id: string; title: string; tone: 'green' | 'blue' | 'slate'; subtitle?: string }

export const columns: { title: string; tone: Agent['tone']; agents: Agent[] }[] = [
  {
    title: 'Analistas',
    tone: 'green',
    agents: [
      { id: 'AF-001', title: 'Analista Financiero', tone: 'green', subtitle: 'Disponible' },
      { id: 'AD-002', title: 'Analista de Datos', tone: 'green', subtitle: 'Disponible' },
      { id: 'AM-003', title: 'Analista de Mercado', tone: 'green' },
      { id: 'AR-004', title: 'Analista de Riesgo', tone: 'green' },
      { id: 'AT-005', title: 'Analista de Tendencias', tone: 'green' },
      { id: 'AE-006', title: 'Analista Estratégico', tone: 'green' }
    ]
  },
  {
    title: 'Informes',
    tone: 'blue',
    agents: [
      { id: 'GI-007', title: 'Generador de Informes', tone: 'blue' },
      { id: 'IE-008', title: 'Informe Ejecutivo', tone: 'blue' },
      { id: 'IT-009', title: 'Informe Técnico', tone: 'blue' },
      { id: 'IM-010', title: 'Informe Mensual', tone: 'blue' },
      { id: 'IA-011', title: 'Informe de Auditoría', tone: 'blue' },
      { id: 'IC-012', title: 'Informe de Calidad', tone: 'blue' }
    ]
  },
  {
    title: 'Reportes',
    tone: 'slate',
    agents: [
      { id: 'RV-013', title: 'Reporte de Ventas', tone: 'slate' },
      { id: 'RK-014', title: 'Reporte de KPIs', tone: 'slate' },
      { id: 'RI-015', title: 'Reporte de Incidentes', tone: 'slate' },
      { id: 'RP-016', title: 'Reporte de Performance', tone: 'slate' },
      { id: 'RO-017', title: 'Reporte Operativo', tone: 'slate' },
      { id: 'RT-018', title: 'Reporte Trimestral', tone: 'slate' }
    ]
  }
]
