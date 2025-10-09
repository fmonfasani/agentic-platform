import { Module } from '@nestjs/common'
import { AgentsModule } from './agents/agents.module'
import { DashboardModule } from './dashboard/dashboard.module'

@Module({
  imports: [AgentsModule, DashboardModule],
})
export class AppModule {}
