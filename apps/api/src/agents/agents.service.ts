import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

type MetricsField = 'uses' | 'downloads' | 'rewards'

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

  async findById(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        metrics: true,
        workflows: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    })

    if (!agent) {
      throw new NotFoundException(`Agent with id "${id}" not found`)
    }

    const metrics = agent.metrics ?? { id: null, uses: 0, downloads: 0, rewards: 0, agentId: agent.id }

    return {
      id: agent.id,
      name: agent.name,
      area: agent.area,
      description: agent.description,
      stars: agent.stars,
      votes: agent.votes,
      metrics: {
        uses: metrics.uses,
        downloads: metrics.downloads,
        rewards: metrics.rewards,
        stars: agent.stars,
        votes: agent.votes
      },
      workflows: agent.workflows
    }
  }

  async incrementMetric(id: string, field: MetricsField) {
    await this.ensureAgentExists(id)

    await this.prisma.metrics.upsert({
      where: { agentId: id },
      update: { [field]: { increment: 1 } },
      create: {
        agentId: id,
        uses: field === 'uses' ? 1 : 0,
        downloads: field === 'downloads' ? 1 : 0,
        rewards: field === 'rewards' ? 1 : 0
      }
    })

    return this.findById(id)
  }

  async rateAgent(id: string, stars: number) {
    if (typeof stars !== 'number' || Number.isNaN(stars)) {
      throw new BadRequestException('Rating value must be a number')
    }

    if (stars < 0 || stars > 5) {
      throw new BadRequestException('Rating value must be between 0 and 5')
    }

    const agent = await this.prisma.agent.findUnique({ where: { id } })

    if (!agent) {
      throw new NotFoundException(`Agent with id "${id}" not found`)
    }

    const newVotes = agent.votes + 1
    const newStars = Number(((agent.stars * agent.votes + stars) / newVotes).toFixed(2))

    await this.prisma.agent.update({
      where: { id },
      data: {
        votes: { increment: 1 },
        stars: newStars
      }
    })

    return this.findById(id)
  }

  private async ensureAgentExists(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } })

    if (!agent) {
      throw new NotFoundException(`Agent with id "${id}" not found`)
    }
  }
}
