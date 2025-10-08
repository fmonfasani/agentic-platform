-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "description" TEXT,
    "stars" REAL NOT NULL DEFAULT 0,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "rewards" INTEGER NOT NULL DEFAULT 0,
    "agentId" TEXT NOT NULL,
    CONSTRAINT "Metrics_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ready',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o',
    "platform" TEXT NOT NULL DEFAULT 'OpenAI',
    "action" TEXT,
    "value" REAL,
    "agentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Metrics_agentId_key" ON "Metrics"("agentId");
