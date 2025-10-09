import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AgentRunnerService } from './agent-runner.service'
import { AgentsService } from './agents.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService, private readonly runnerService: AgentRunnerService) {}

  @Get()
  getAll() {
    return this.agentsService.listAgents()
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.agentsService.getAgent(id)
  }

  @Post()
  create(@Body() data: any) {
    return this.agentsService.create(data)
  }

  @Post(':id/chat-session')
  createChatSession(@Param('id') id: string) {
    return this.runnerService.createChatSession(id)
  }
}
