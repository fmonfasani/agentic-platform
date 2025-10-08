import { Injectable, NotFoundException } from '@nestjs/common'
import { Agent, Metrics, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

type AgentSummary = {
  id: string
  name: string
  area: string
  description?: string | null
  stars: number
  votes: number
  uses: number
  downloads: number
  rewards: number
}

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        area: true,
        stars: true,
        votes: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    }
    async runWorkflow(agentId: string, action?: string, input?: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    // simulás una respuesta
    return {
      agentId,
      action,
      input,
      status: 'executed',
      timestamp: new Date(),
    };
  }


  async findById(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: { metrics: true, workflows: true }
    })

    if (!agent) {
      throw new NotFoundException('Agent not found')
    }

    const { workflows, metrics, ...rest } = agent

    return {
      ...rest,
      metrics: this.toMetrics(metrics, agent),
      workflows: workflows.map((workflow) => ({
        id: workflow.id,
        name: workflow.name,
        status: workflow.status,
        model: workflow.model,
        platform: workflow.platform
      }))
    }
  }

  async incrementMetric(id: string, field: keyof Metrics) {
    try {
      const updatedMetrics = await this.prisma.metrics.update({
        where: { agentId: id },
        data: { [field]: { increment: 1 } },
        include: { agent: true }
      })

      return this.toSummary({ ...updatedMetrics.agent, metrics: updatedMetrics })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Agent not found')
      }
      throw error
    }
  }

  async rateAgent(id: string, stars: number) {
    const parsedStars = typeof stars === 'number' ? stars : Number(stars)
    const safeStars = Math.max(0, Math.min(5, Number.isFinite(parsedStars) ? parsedStars : 0))

    const updatedAgent = await this.prisma.$transaction(async (tx) => {
      const agent = await tx.agent.findUnique({
        where: { id },
        include: { metrics: true }
      })

      if (!agent) {
        throw new NotFoundException('Agent not found')
      }

      const newVotes = agent.votes + 1
      const calculatedAverage = agent.votes === 0 ? safeStars : (agent.stars * agent.votes + safeStars) / newVotes
      const starsAverage = Number(calculatedAverage.toFixed(2))

      return tx.agent.update({
        where: { id },
        data: {
          votes: newVotes,
          stars: starsAverage
        },
        include: { metrics: true }
      })
    })

    return this.toSummary(updatedAgent)
  }

  private toSummary(agent: Agent & { metrics?: Metrics | null }): AgentSummary {
    return {
      id: agent.id,
      name: agent.name,
      area: agent.area,
      description: agent.description,
      stars: agent.stars,
      votes: agent.votes,
      ...this.toMetrics(agent.metrics, agent)
    }
  }

  private toMetrics(metrics: Metrics | null | undefined, agent: { stars: number; votes: number }): {
    uses: number
    downloads: number
    rewards: number
    stars: number
    votes: number
  } {
    return {
      uses: metrics?.uses ?? 0,
      downloads: metrics?.downloads ?? 0,
      rewards: metrics?.rewards ?? 0,
      stars: agent.stars,
      votes: agent.votes
    }
  }
}
