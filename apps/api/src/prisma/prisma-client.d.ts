declare module '@prisma/client' {
  export class PrismaClient {
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
    }
  }

  export namespace Prisma {
    // Minimal stub to satisfy tests without generating Prisma types
    type AgentCreateInput = Record<string, unknown>
  }
}
