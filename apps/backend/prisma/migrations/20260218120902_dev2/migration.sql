-- CreateTable
CREATE TABLE "request_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "env" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "tracingId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "responseSize" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_explorer_snapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "env" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_explorer_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_log_organizationId_env_idx" ON "request_log"("organizationId", "env");

-- CreateIndex
CREATE INDEX "request_log_organizationId_env_timestamp_idx" ON "request_log"("organizationId", "env", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "api_explorer_snapshot_organizationId_env_key" ON "api_explorer_snapshot"("organizationId", "env");
