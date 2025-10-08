import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { AgentRunnerService, AgentRunPayload } from './agent-runner.service'
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

  @Get(':id/traces')
  listTraces(@Param('id') id: string, @Query('take') take?: string) {
    const parsed = take ? Number.parseInt(take, 10) : NaN
    const amount = Number.isNaN(parsed) ? undefined : parsed
    return this.runnerService.listTraces(id, amount)
  }

  @Post(':id/run')
  runAgent(@Param('id') id: string, @Body() payload: AgentRunPayload) {
    return this.runnerService.run(id, payload)
  }

  @Post(':id/chat-session')
  createChatSession(@Param('id') id: string) {
    return this.runnerService.createChatSession(id)
  }
}
