import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { DashboardController } from './dashboard.controller'

@Module({
  controllers: [DashboardController],
  providers: [PrismaService],
})
export class DashboardModule {}
