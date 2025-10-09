import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomStars = () => Number((Math.random() * 2 + 3).toFixed(1));

async function main() {
  await prisma.agent.createMany({
    data: [
      {
        name: 'Analista Técnico',
        description:
          'Especialista en diagnósticos de infraestructura y optimización de despliegues tecnológicos.',
        area: 'Infraestructura y Operaciones',
        uses: randomInt(150, 600),
        downloads: randomInt(50, 200),
        rewards: randomInt(5, 25),
        stars: randomStars(),
        votes: randomInt(10, 80)
      },
      {
        name: 'Analista Financiero y Contable',
        description:
          'Integra balances, presupuestos y proyecciones para apoyar la toma de decisiones financieras.',
        area: 'Gestión Financiera y Contable',
        uses: randomInt(120, 500),
        downloads: randomInt(40, 180),
        rewards: randomInt(5, 20),
        stars: randomStars(),
        votes: randomInt(8, 70)
      },
      {
        name: 'Gestión Regulatoria',
        type: 'regulatory',
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
        type: 'reporting',
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
