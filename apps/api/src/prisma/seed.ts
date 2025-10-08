import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.agent.createMany({
    data: [
      { name: 'Analista Técnico', description: 'Procesa informes técnicos' },
      { name: 'Analista Financiero', description: 'Evalúa datos contables y presupuestarios' },
      { name: 'Analista de Licencias', description: 'Controla los permisos y autorizaciones' }
    ],
  });
}

main()
  .then(() => console.log('Seed completo ✅'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
