declare module '@prisma/client' {
  export class PrismaClient {
    $connect: () => Promise<void>
    $disconnect: () => Promise<void>
    agent: {
      findMany: (...args: unknown[]) => Promise<any>
      findUnique: (...args: unknown[]) => Promise<any>
      create: (...args: unknown[]) => Promise<any>
      update: (...args: unknown[]) => Promise<any>
    }
    agentTrace: {
      create: (...args: unknown[]) => Promise<any>
      update: (...args: unknown[]) => Promise<any>
      findMany: (...args: unknown[]) => Promise<any>
      findUnique: (...args: unknown[]) => Promise<any>
      findFirst: (...args: unknown[]) => Promise<any>
    }
  }

  export namespace Prisma {
    // Minimal stub to satisfy tests without generating Prisma types
    type AgentCreateInput = Record<string, unknown>
    type AgentTraceWhereInput = {
      AND?: AgentTraceWhereInput | AgentTraceWhereInput[]
      OR?: AgentTraceWhereInput[]
      NOT?: AgentTraceWhereInput | AgentTraceWhereInput[]
      id?: string
      agentId?: string
      runId?: string
    }
  }
}
