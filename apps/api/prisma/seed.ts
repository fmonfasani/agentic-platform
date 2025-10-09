import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.agent.createMany({
    data: [
      {
        name: 'Analista Técnico',
        description: 'Procesa informes técnicos',
        area: 'Infraestructura y despliegues'
      },
      {
        name: 'Analista Financiero',
        description: 'Evalúa datos contables y presupuestarios',
        area: 'Presupuesto y contabilidad'
      },
      {
        name: 'Analista de Licencias',
        description: 'Controla los permisos y autorizaciones',
        area: 'Gestión de licencias'
      },
      {
        name: 'Gestión Regulatoria',
        description: 'Monitorea el cumplimiento normativo y los procesos de licenciamiento TIC.',
        area: 'Gestión Regulatoria y Licencias',
        uses: 58,
        downloads: 24,
        rewards: 6,
        stars: 4.3,
        votes: 42
      },
      {
        name: 'Reportes e Informes',
        description: 'Genera tableros ejecutivos y reportes institucionales automatizados.',
        area: 'Reportes e Informes Institucionales',
        uses: 87,
        downloads: 33,
        rewards: 11,
        stars: 4.6,
        votes: 73
      }
    ]
  });
}

main()
  .then(() => console.log('Seed completo ✅'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
