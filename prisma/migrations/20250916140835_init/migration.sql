-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."RelayStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "public"."devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."telemetry_pings" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetry_pings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "providerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."relay_logs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "status" "public"."RelayStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relay_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceId_key" ON "public"."devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "telemetry_pings_eventId_key" ON "public"."telemetry_pings"("eventId");

-- CreateIndex
CREATE INDEX "telemetry_pings_deviceId_ts_idx" ON "public"."telemetry_pings"("deviceId", "ts");

-- CreateIndex
CREATE INDEX "subscriptions_deviceId_status_idx" ON "public"."subscriptions"("deviceId", "status");

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "public"."subscriptions"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "clients_clientId_key" ON "public"."clients"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_apiKey_key" ON "public"."clients"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "relay_logs_idempotencyKey_key" ON "public"."relay_logs"("idempotencyKey");

-- CreateIndex
CREATE INDEX "relay_logs_status_nextRetryAt_idx" ON "public"."relay_logs"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "relay_logs_clientId_idx" ON "public"."relay_logs"("clientId");

-- AddForeignKey
ALTER TABLE "public"."telemetry_pings" ADD CONSTRAINT "telemetry_pings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."devices"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."relay_logs" ADD CONSTRAINT "relay_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
