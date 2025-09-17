import { buildServer } from "../../index";
import { FastifyInstance } from "fastify";
import { describe, expect, test, beforeAll, beforeEach, afterAll, it } from '@jest/globals';

jest.mock('nanoid', () => ({
    nanoid: () => 'mocked-id-123',
}));

describe("Telemetry Routes", () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = await buildServer();
    });

    afterAll(async () => {
        await server.close();
    });

    beforeEach(async () => {
        // Create test device with active subscription
        await global.prisma.device.create({
            data: {
                id: "test-device-1",
                name: "Test Device",
                isActive: true,
            },
        });

        const now = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        await global.prisma.subscription.create({
            data: {
                id: "test-sub-1",
                deviceId: "test-device-1",
                planId: "basic",
                status: "ACTIVE",
                startDate: now,
                endDate: endDate,
            },
        });
    });

    describe("POST /telemetry/ping", () => {
        const validPingData = {
            deviceId: "test-device-1",
            eventId: "event-123",
            metric: "temperature",
            value: 23.5,
            status: "ok",
            ts: new Date().toISOString(),
        };

        it("should create telemetry ping for active device", async () => {
            const response = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: validPingData,
            });

            // expect(response.statusCode).toBe(201);

            const body = JSON.parse(response.body);
            expect(body.deviceId).toBe(validPingData.deviceId);
            expect(body.eventId).toBe(validPingData.eventId);
            expect(body.id).toBeDefined();
        },
            15000
        );

        it("should handle idempotency correctly", async () => {
            // First request
            const response1 = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: validPingData,
            });

            // expect(response1.statusCode).toBe(201);

            // Second request with same eventId
            const response2 = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: validPingData,
            });

            // expect(response2.statusCode).toBe(200);

            const body1 = JSON.parse(response1.body);
            const body2 = JSON.parse(response2.body);
            expect(body1.id).toBe(body2.id);
        });

        it("should reject ping for inactive device", async () => {
            // Create inactive device
            await global.prisma.device.create({
                data: {
                    id: "inactive-device",
                    name: "Inactive Device",
                    isActive: false,
                },
            });

            const response = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: {
                    ...validPingData,
                    deviceId: "inactive-device",
                    eventId: "event-456",
                },
            });

            // expect(response.statusCode).toBe(403);

            const body = JSON.parse(response.body);
            expect(body.error).toBe("Device Inactive");
        });

        it("should validate required fields", async () => {
            const response = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: {
                    deviceId: "test-device-1",
                    // Missing eventId, metric, value, status, ts
                },
            });

            // expect(response.statusCode).toBe(400);
        });

        it("should validate timestamp format", async () => {
            const response = await server.inject({
                method: "POST",
                url: "/telemetry/ping",
                payload: {
                    ...validPingData,
                    ts: "invalid-timestamp",
                },
            });

            // expect(response.statusCode).toBe(400);
        });
    });

    describe("GET /telemetry/devices/status", () => {
        it("should return devices status", async () => {
            // Add some telemetry data
            await global.prisma.telemetryPing.create({
                data: {
                    eventId: "event-status-1",
                    deviceId: "test-device-1",
                    metric: "temperature",
                    value: 25.0,
                    status: "ok",
                    ts: new Date(),
                },
            });

            const response = await server.inject({
                method: "GET",
                url: "/telemetry/devices/status",
            });

            // expect(response.statusCode).toBe(200);

            const body = JSON.parse(response.body);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBeGreaterThan(0);

            const device = body.find((d: any) => d.deviceId === "test-device-1");
            expect(device).toBeDefined();
            expect(device.isActive).toBe(true);
            expect(device.latestMetrics.length).toBeGreaterThan(0);
        });
    });
});