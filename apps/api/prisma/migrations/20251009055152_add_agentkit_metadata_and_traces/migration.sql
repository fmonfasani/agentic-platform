-- Add AgentKit metadata columns to Agent
ALTER TABLE "Agent" ADD COLUMN "openaiAgentId" TEXT;
ALTER TABLE "Agent" ADD COLUMN "model" TEXT DEFAULT 'gpt-4.1-mini';
ALTER TABLE "Agent" ADD COLUMN "instructions" TEXT;

-- Create AgentTrace table for AgentKit runs
CREATE TABLE "AgentTrace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "grade" REAL,
    "evaluator" TEXT,
    "traceUrl" TEXT,
    "input" TEXT,
    "output" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentTrace_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
