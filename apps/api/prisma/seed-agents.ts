import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import 'dotenv/config';

type SeedAgent = {
  name: string;
  area: string;
  description: string;
  instructions: string;
};

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const seedAgents: SeedAgent[] = [
  {
    name: 'Analista Técnico',
    area: 'Infraestructura y Radiocomunicaciones',
    description: 'Evalúa la performance de redes, espectro y equipos.',
    instructions: 'Analiza logs técnicos, evalúa rendimiento y genera reportes automatizados.',
  },
  {
    name: 'Analista Financiero',
    area: 'Gestión Presupuestaria',
    description: 'Evalúa gastos, presupuestos y KPIs financieros del ENACOM.',
    instructions: 'Genera reportes de gastos trimestrales y evalúa desviaciones presupuestarias.',
  },
  {
    name: 'Analista Regulatorio',
    area: 'Gestión de Licencias y Autorizaciones',
    description: 'Asiste en procesos de licencias, normativas y compliance.',
    instructions: 'Evalúa cumplimiento normativo y genera resúmenes de regulaciones TIC.',
  },
  {
    name: 'Analista Estratégico',
    area: 'Planeamiento y Regulación',
    description: 'Genera informes estratégicos para decisiones institucionales.',
    instructions: 'Integra datos técnicos y financieros para generar reportes ejecutivos.',
  },
  {
    name: 'Reporte Institucional',
    area: 'Dirección Nacional de Servicios TIC',
    description: 'Produce informes automatizados de resultados institucionales.',
    instructions: 'Genera reportes y visualizaciones de alto nivel basados en datos internos.',
  },
];

async function createOpenAIAgent(agent: SeedAgent): Promise<string> {
  const agentsApi = (openai as any).agents;
  const response = await agentsApi.create({
    name: agent.name,
    model: 'gpt-4.1-mini',
    instructions: agent.instructions,
    metadata: {
      area: agent.area,
      origin: 'ENACOM Platform',
    },
    tools: [
      { type: 'code_interpreter' },
      { type: 'file_search' },
      { type: 'retrieval' },
    ],
  });

  return response.id;
}

async function seed() {
  console.log('🌱 Inicializando agentes inteligentes...\n');

  for (const agent of seedAgents) {
    try {
      console.log(`→ Creando agente en OpenAI: ${agent.name}...`);
      const openaiAgentId = await createOpenAIAgent(agent);

      const record = await prisma.agent.create({
        data: {
          name: agent.name,
          area: agent.area,
          description: agent.description,
          openaiAgentId,
          instructions: agent.instructions,
          uses: Math.floor(Math.random() * 250),
          downloads: Math.floor(Math.random() * 150),
          rewards: Math.floor(Math.random() * 12),
          stars: 3.5 + Math.random() * 1.5,
          votes: 15 + Math.floor(Math.random() * 90),
        },
      });

      console.log(`✅ Agente ${record.name} creado con ID ${record.id}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(`❌ Error creando ${agent.name}:`, err.message);
      } else {
        console.error(`❌ Error creando ${agent.name}:`, err);
      }
    }
  }

  console.log('\n🎉 Seed completado con éxito.');
  await prisma.$disconnect();
}

seed().catch(async (error) => {
  console.error('❌ Error inesperado durante el seed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
