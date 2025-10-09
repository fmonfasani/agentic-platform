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
        name: 'Gestor Regulatorio',
        description:
          'Monitorea cambios normativos y prepara respuestas para garantizar el cumplimiento regulatorio.',
        area: 'Cumplimiento Normativo',
        uses: randomInt(90, 400),
        downloads: randomInt(30, 150),
        rewards: randomInt(3, 18),
        stars: randomStars(),
        votes: randomInt(5, 60)
      },
      {
        name: 'Reportes e Informes',
        description:
          'Automatiza la consolidación de KPIs y genera informes ejecutivos para distintos equipos.',
        area: 'Inteligencia de Negocio',
        uses: randomInt(110, 450),
        downloads: randomInt(35, 160),
        rewards: randomInt(4, 22),
        stars: randomStars(),
        votes: randomInt(7, 75)
      }
    ]
  });
}

main()
  .then(() => console.log('Seed completo ✅'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
