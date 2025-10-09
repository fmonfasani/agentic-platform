import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTraces() {
  const agents = await prisma.agent.findMany()
  for (const agent of agents) {
    await prisma.agentTrace.create({
      data: {
        agentId: agent.id,
        runId: `seed-${Math.floor(Math.random() * 9999)}`,
        status: 'completed',
        grade: Math.random(),
        evaluator: 'auto-seed',
        input: 'Test run automático',
        output: JSON.stringify([{ role: 'assistant', content: 'Resultado simulado' }]),
      },
    })
  }
  // eslint-disable-next-line no-console
  console.log('✅ Seed de trazas completado')
}

seedTraces().finally(() => prisma.$disconnect())
