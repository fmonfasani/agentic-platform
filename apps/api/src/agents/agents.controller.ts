import { Controller, Get, Param, Post } from '@nestjs/common'
import { AgentRunnerService } from './agent-runner.service'
import { AgentsService } from './agents.service'

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService, private readonly runnerService: AgentRunnerService) {}

  @Get()
  findAll() {
    return this.agentsService.listAgents()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentsService.getAgent(id)
  }

  @Post(':id/chat-session')
  createChatSession(@Param('id') id: string) {
    return this.runnerService.createChatSession(id)
  }
}
