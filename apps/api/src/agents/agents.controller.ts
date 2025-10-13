import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AgentRunnerService } from './agent-runner.service'
import { AgentsService } from './agents.service'

type CreateAgentDto = Parameters<AgentsService['createAgent']>[0]

@Controller('agents')
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly runnerService: AgentRunnerService,
  ) {}

  // ✅ Obtener todos los agentes
  @Get()
  getAll() {
    return this.agentsService.findAll()
  }

  // ✅ Obtener agente por ID
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.agentsService.findOne(id)
  }

  // ✅ Crear agente (meta-agente / SDK / visual builder)
  @Post('create')
  async createAgent(@Body() body: CreateAgentDto) {
    return this.agentsService.createAgent(body)
  }

  // ✅ Crear sesión de chat con un agente (para ChatKit)
  @Post(':id/chat-session')
  createChatSession(@Param('id') id: string) {
    return this.runnerService.createChatSession(id)
  }
}
