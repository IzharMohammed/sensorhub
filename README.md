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

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run specific test file
npm test -- telemetry.test.ts
```

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

### 1. Subscribe a Device

```bash
curl -X POST http://localhost:3000/billing/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-001",
    "planId": "basic"
  }'
```

### 2. Send Telemetry Data

```bash
curl -X POST http://localhost:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "sensor-001",
    "eventId": "evt-12345",
    "metric": "temperature", 
    "value": 23.5,
    "status": "ok",
    "ts": "2025-01-15T10:30:00.000Z"
  }'
```

### 3. Publish Relay Message

```bash
curl -X POST http://localhost:3000/relay/publish \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_key_12345" \
  -d '{
    "clientId": "client_test_1",
    "message": "Device alert: Temperature threshold exceeded",
    "meta": {
      "type": "alert",
      "priority": "high"
    }
  }'
```

## 📋 Postman Collection

### Import this collection into Postman:

```json
{
  "info": {
    "name": "SensorHub API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/health",
          "host": ["{{base_url}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Subscribe Device",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"deviceId\": \"device_test_1\",\n  \"planId\": \"basic\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/billing/subscribe",
          "host": ["{{base_url}}"],
          "path": ["billing", "subscribe"]
        }
      }
    },
    {
      "name": "Send Telemetry",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"deviceId\": \"device_test_3\",\n  \"eventId\": \"evt-{{$randomInt}}\",\n  \"metric\": \"temperature\",\n  \"value\": {{$randomInt}},\n  \"status\": \"ok\",\n  \"ts\": \"{{$isoTimestamp}}\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/telemetry/ping",
          "host": ["{{base_url}}"],
          "path": ["telemetry", "ping"]
        }
      }
    },
    {
      "name": "Publish Relay Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "x-api-key",
            "value": "test_key_12345"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"clientId\": \"client_test_1\",\n  \"message\": \"Test alert message\",\n  \"meta\": {\n    \"type\": \"alert\",\n    \"priority\": \"high\"\n  }\n}"
        },
        "url": {
          "raw": "{{base_url}}/relay/publish",
          "host": ["{{base_url}}"],
          "path": ["relay", "publish"]
        }
      }
    },
    {
      "name": "Get Device Status",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/telemetry/devices/status",
          "host": ["{{base_url}}"],
          "path": ["telemetry", "devices", "status"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

## 🧪 Test Scenarios

### 1. Idempotency Testing

**Test duplicate telemetry pings:**
```bash
# Send same request twice
curl -X POST http://localhost:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_test_3", "eventId": "duplicate-test", "metric": "temperature", "value": 25, "status": "ok", "ts": "2025-01-15T10:30:00.000Z"}'

# Second request should return 200 with same ID
curl -X POST http://localhost:3000/telemetry/ping \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "device_test_3", "eventId": "duplicate-test", "metric": "temperature", "value": 25, "status": "ok", "ts": "2025-01-15T10:30:00.000Z"}'
```

### 2. Retry Logic Testing

**Test relay retries:**
```bash
# Send relay message (might fail and retry)
curl -X POST http://localhost:3000/relay/publish \
  -H "Content-Type: application/json" \
  -H "x-api-key: test_key_12345" \
  -d '{"clientId": "client_test_1", "message": "Retry test message", "meta": {"test": true}}'
```

Check logs to see retry attempts with exponential backoff.

### 3. Subscription Expiry Testing

Run the test suite to see expired subscription handling:
```bash
npm test -- billing.test.ts
```

### 4. Rate Limiting Testing

**Test telemetry rate limits (100/min per device):**
```bash
# Send rapid requests to trigger rate limit
for i in {1..105}; do
  curl -X POST http://localhost:3000/telemetry/ping \
    -H "Content-Type: application/json" \
    -d "{\"deviceId\": \"device_test_3\", \"eventId\": \"rate-test-$i\", \"metric\": \"temperature\", \"value\": 25, \"status\": \"ok\", \"ts\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"}" &
done
wait
```

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

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Assignment Notes

This implementation demonstrates:

- ✅ **Clean Architecture**: Layered structure with routes → controllers → services
- ✅ **Production Practices**: Error handling, logging, rate limiting, health checks
- ✅ **Idempotency**: Event IDs for telemetry, idempotency keys for relay
- ✅ **Retry Logic**: Exponential backoff for failed relay messages
- ✅ **Subscription Management**: Payment processing with device activation
- ✅ **Background Processing**: Worker for retry attempts and subscription expiry
- ✅ **Comprehensive Testing**: Unit tests covering key scenarios
- ✅ **TypeScript**: Full type safety and modern practices
- ✅ **Documentation**: Complete setup and usage guide

**Time Investment**: ~16-18 hours as requested, focusing on production-ready code with proper error handling, logging, and testing.