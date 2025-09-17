# SensorHub and Relay Mini Service

A production-ready backend service that demonstrates device telemetry ingestion, subscription management, and message relay functionality with proper error handling, rate limiting, and retry mechanisms.

## 🏗️ Architecture Overview

This service implements:

- **Device Telemetry System**: Ingests sensor data from IoT devices
- **Subscription Management**: Handles yearly subscriptions with payment processing
- **Message Relay System**: Forwards notifications to external providers with retry logic
- **Production Features**: Rate limiting, structured logging, error handling, idempotency

## 📋 Features

- ✅ **Telemetry Ingestion** with device activation checks
- ✅ **Subscription Management** with mock payment processing
- ✅ **Message Relay** with exponential backoff retries
- ✅ **Idempotency** handling for all endpoints
- ✅ **Rate Limiting** per device/client
- ✅ **Structured Logging** with request IDs
- ✅ **Health Checks** and readiness probes
- ✅ **Background Workers** for retry processing
- ✅ **Comprehensive Testing** suite

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for rate limiting
- **Validation**: Zod with JSON Schema
- **Logging**: Pino

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm

### 1. Clone and Install

```bash
git clone git@github.com:IzharMohammed/sensorhub.git
cd sensorhub
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database and Redis URLs:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sensorhub"
REDIS_URL="redis://localhost:6379"
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed test data
pnpm db:seed
```

### 4. Start Services

**Development Mode:**

```bash
pnpm run dev
```

The server will start on `http://localhost:3000`

### Key Test Scenarios

The test suite covers:

1. **Idempotency Tests**

   - Duplicate telemetry pings return same result
   - Relay messages with same idempotency key

2. **Retry Logic Tests**

   - Failed relay messages are retried with exponential backoff
   - Max retry attempts are respected

3. **Subscription Expiry Tests**
   - Expired subscriptions deactivate devices
   - Devices with multiple subscriptions stay active

## 📡 API Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /ready` - Readiness probe (checks DB/Redis)

### Telemetry

- `POST /telemetry/ping` - Submit device telemetry
- `GET /telemetry/devices/status` - Get all device statuses

### Billing

- `POST /billing/subscribe` - Subscribe device to yearly plan

### Relay

- `POST /relay/publish` - Publish message to external provider

### Mock Providers (for testing)

- `POST /mock-pay/charge` - Mock payment processor
- `POST /mock-relay/receive` - Mock relay receiver

## 🔧 API Usage Examples

## Test these curl commands only after seeding the data as the examples here are related to data which is seeded

## 1. Health & Ready Checks

### GET Health Check

```bash
curl -X GET http://127.0.0.1:3000/health
```

### GET Ready Check

```bash
curl -X GET http://127.0.0.1:3000/ready
```

## 2. Telemetry Endpoints

### POST Create Telemetry Ping (will fail - device inactive)

```bash
curl -X POST http://127.0.0.1:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_test_1",
    "eventId": "evt-1001",
    "metric": "temperature",
    "value": 27.5,
    "status": "ok",
    "ts": "2025-09-17T12:34:56.000Z"
  }'
```

### POST Create Telemetry Ping (will succeed - device active)

```bash
curl -X POST http://127.0.0.1:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_test_3",
    "eventId": "evt-1002",
    "metric": "temperature",
    "value": 25.0,
    "status": "ok",
    "ts": "2025-09-17T12:35:00.000Z"
  }'
```

### POST Test Idempotency (same eventId - should return existing)

```bash
curl -X POST http://127.0.0.1:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_test_3",
    "eventId": "evt-1002",
    "metric": "temperature",
    "value": 25.0,
    "status": "ok",
    "ts": "2025-09-17T12:35:00.000Z"
  }'
```

### GET Devices Status

```bash
curl -X GET http://127.0.0.1:3000/telemetry/devices/status
```

## 3. Billing Endpoints

### POST Subscribe Device (payment might fail randomly)

```bash
curl -X POST http://127.0.0.1:3000/billing/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_test_1",
    "planId": "basic"
  }'
```

### POST Subscribe Another Device

```bash
curl -X POST http://127.0.0.1:3000/billing/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device_test_2",
    "planId": "premium"
  }'
```

## 4. Relay Endpoints

### POST Publish Relay Message

```bash
curl -X POST http://127.0.0.1:3000/relay/publish \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_key_12345" \
  -d '{
    "clientId": "client_test_1",
    "message": "Device alert: Temperature threshold exceeded",
    "meta": {
      "type": "alert",
      "priority": "high",
      "deviceId": "device_test_3"
    }
  }'
```

### POST Test Relay Idempotency

```bash
curl -X POST http://127.0.0.1:3000/relay/publish \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_key_12345" \
  -H "x-idempotency-key: custom-key-123" \
  -d '{
    "clientId": "client_test_1",
    "message": "Test idempotency message",
    "meta": {
      "test": true
    }
  }'
```

### POST Test Unauthorized (no API key)

```bash
curl -X POST http://127.0.0.1:3000/relay/publish \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client_test_1",
    "message": "This should fail"
  }'
```

### POST Test Invalid API Key

```bash
curl -X POST http://127.0.0.1:3000/relay/publish \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid_key" \
  -d '{
    "clientId": "client_test_1",
    "message": "This should fail"
  }'
```

## 5. Mock Provider Endpoints

### POST Mock Payment

```bash
curl -X POST http://127.0.0.1:3000/mock-pay/charge \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "test-sub-123",
    "planId": "basic",
    "amount": 99.99
  }'
```

### POST Mock Relay

```bash
curl -X POST http://127.0.0.1:3000/mock-relay/receive \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "relay-key-123",
    "message": "Test relay message",
    "meta": {
      "source": "test"
    }
  }'
```

## Usage Notes

- All requests are targeted at `http://127.0.0.1:3000`
- JSON payloads are formatted for readability with line breaks
- Headers are specified using `-H` flag
- POST data is specified using `-d` flag
- Some endpoints expect specific behavior (failures, idempotency, etc.) as noted in the comments

## 📊 Data Models

### Device

- Device information and activation status
- Links to subscriptions and telemetry

### TelemetryPing

- Sensor readings with idempotency
- Timestamped metrics and status

### Subscription

- Yearly plans with start/end dates
- Payment provider references

### Client

- API clients for relay system
- API key authentication

### RelayLog

- Message relay attempts and status
- Retry logic with exponential backoff

## 🔍 Monitoring & Logging

All requests include structured logging with:

- Request IDs for tracing
- Response times
- Error details (without stack traces in production)
- Business logic events

Example log output:

```json
{
  "level": "INFO",
  "time": "2025-01-15T10:30:00.000Z",
  "reqId": "req_1234567890",
  "msg": "Processing telemetry ping",
  "deviceId": "sensor-001",
  "eventId": "evt-12345"
}
```

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
LOG_LEVEL=warn
TELEMETRY_RATE_LIMIT=1000
RELAY_RATE_LIMIT=500
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Health Checks

- `/health` - Returns 200 if service is running
- `/ready` - Returns 200 if service can connect to DB and Redis

## 🔧 Configuration

### Rate Limits

- Global: 1000 requests/minute
- Telemetry: 100 requests/minute per device
- Relay: 50 requests/minute per client

### Retry Policy

- Max attempts: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: 5xx errors from providers

### Mock Failure Rates

- Payment: 30% failure rate
- Relay: 20% failure rate
