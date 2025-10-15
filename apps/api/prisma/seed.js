const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================
// Datos de agentes ENACOM
// ============================
const agentsData = [
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
        platform: 'OpenAI',
      },
      {
        id: 'wf-analista-tecnico-2',
        name: 'Diagnóstico de Equipamiento',
        status: 'draft',
        model: 'gpt-4o-mini',
        platform: 'OpenAI',
      },
    ],
  },
  {
    id: '1a9efb77-02cc-49db-bc0e-7cf9e19dd5c1',
    name: 'Analista Financiero',
    area: 'Gestión Presupuestaria',
    description:
      'Administra proyecciones financieras y seguimiento presupuestario para programas estratégicos .',
    workflows: [
      {
        id: 'wf-analista-financiero-1',
        name: 'Evaluación Presupuestaria Anual',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI',
      },
    ],
  },
  {
    id: '9d89184f-e36f-4cb8-9f5c-3a700ec367eb',
    name: 'Analista de Licencias',
    area: 'Gestión de Licencias y Autorizaciones',
    description:
      'Evalúa solicitudes de licencias TIC y asesora a los actores en el cumplimiento regulatorio.',
    workflows: [
      {
        id: 'wf-analista-licencias-1',
        name: 'Evaluación de Expedientes TIC',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI',
      },
    ],
  },
  {
    id: '2c68640b-6b63-45bc-9adc-e689b9b9b09c',
    name: 'Generador de Informes',
    area: 'Dirección General',
    description:
      'Automatiza la redacción de informes ejecutivos con datos actualizados y visualizaciones.',
    mode: 'deterministic',
    rules: JSON.stringify([
      { trigger: 'informe', response: '📄 Generando informe estructurado...' },
      { trigger: 'reporte', response: '📊 Preparando reporte detallado...' },
      { trigger: 'analisis', response: '🧠 Analizando datos...' },
    ]),
    workflows: [
      {
        id: 'wf-generador-informes-1',
        name: 'Informe Ejecutivo Semanal',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI',
      },
    ],
  },
  {
    id: '3f65cccb-3d2b-4c38-b81b-f55f1dd95b54',
    name: 'Analista de Riesgo',
    area: 'Auditoría Interna',
    description:
      'Identifica riesgos operativos y sugiere medidas de mitigación en los procesos críticos del organismo.',
    workflows: [
      {
        id: 'wf-analista-riesgo-1',
        name: 'Mapa de Riesgos Operativos',
        status: 'ready',
        model: 'gpt-4o',
        platform: 'OpenAI',
      },
    ],
  },
];

// ============================
// Funciones auxiliares
// ============================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================
// Seed principal
// ============================
async function main() {
  console.log('🧹 Limpiando tablas existentes...');
  await prisma.workflow.deleteMany();
  await prisma.agentTrace.deleteMany();
  await prisma.agent.deleteMany();

  console.log('🚀 Insertando agentes y workflows...');

  for (const agent of agentsData) {
    const uses = randomInt(50, 250);
    const downloads = randomInt(25, 160);
    const rewards = randomInt(0, 12);
    const votes = randomInt(5, 80);
    const stars = Number((3.5 + Math.random() * 1.5).toFixed(1));

    await prisma.agent.create({
      data: {
        id: agent.id,
        name: agent.name,
        area: agent.area,
        description: agent.description,
        mode: agent.mode ?? 'llm',
        rules: agent.rules ?? null,
        uses,
        downloads,
        rewards,
        stars,
        votes,
        workflows: {
          create: agent.workflows,
        },
      },
    });
  }

  console.log('✅ Seed completado correctamente');
}

// ============================
// Ejecución del seed
// ============================
main()
  .catch((error) => {
    console.error('❌ Error al ejecutar el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
