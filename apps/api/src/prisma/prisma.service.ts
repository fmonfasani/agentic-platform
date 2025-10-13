import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type TableInfoRow = {
  name: string;
};

type TableExistenceRow = {
  name: string;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.ensureAgentTraceFeedbackColumn();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async ensureAgentTraceFeedbackColumn(): Promise<void> {
    try {
      const tableExists = (await this.$queryRaw`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'AgentTrace'
      `) as TableExistenceRow[];

      if (!tableExists.length) {
        return;
      }

      const columns = (await this.$queryRaw`PRAGMA table_info("AgentTrace")`) as TableInfoRow[];
      const hasFeedbackColumn = columns.some((column) => column.name === 'feedback');

      if (!hasFeedbackColumn) {
        await this.$executeRawUnsafe('ALTER TABLE "AgentTrace" ADD COLUMN "feedback" TEXT;');
      }
    } catch (error) {
      console.error('Failed to ensure AgentTrace.feedback column exists:', error);
    }
  }
}
