import { Module } from '@nestjs/common'
import { AgentsModule } from './agents/agents.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { PrismaService } from './prisma/prisma.service'

@Module({
  imports: [AgentsModule, DashboardModule],
  providers: [PrismaService]
})
export class AppModule {}
