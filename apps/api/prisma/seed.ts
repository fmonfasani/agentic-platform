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
      }
    ]
  });
}

main()
  .then(() => console.log('Seed completo ✅'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
