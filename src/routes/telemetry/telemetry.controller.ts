import { FastifyReply, FastifyRequest } from "fastify";
import { CreateTelemetryPingInput } from "./telemetry.schema";
import {
    createTelemetryPing,
    getDevicesStatus,
    getTelemetryPingByEventId,
    isDeviceActive,
} from "./telemetry.service";

export async function createTelemetryPingHandler(
    request: FastifyRequest<{
        Body: CreateTelemetryPingInput;
    }>,
    reply: FastifyReply
) {
    const { eventId, deviceId, ...pingData } = request.body;
    console.log("request.body", request.body);

    request.log.info({ deviceId, eventId }, "Processing telemetry ping");

    try {
        // Check for idempotency
        const existingPing = await getTelemetryPingByEventId(eventId);
        if (existingPing) {
            request.log.info({ eventId }, "Duplicate ping detected, returning existing");
            return reply.code(200).send({
                ...request.body,
                id: existingPing.id,
                createdAt: existingPing.createdAt.toISOString(),
            });
        }

        // Check if device is active and has valid subscription
        const deviceActive = await isDeviceActive(deviceId);
        console.log(deviceActive);

        if (!deviceActive) {
            request.log.warn({ deviceId }, "Telemetry rejected for inactive device");
            return reply.code(403).send({
                error: "Device Inactive",
                message: "Device does not have an active subscription",
                requestId: request.id,
            });
        }

        // Create the ping
        const ping = await createTelemetryPing(request.body);

        request.log.info({ deviceId, pingId: ping.id }, "Telemetry ping created");

        return reply.code(201).send({
            ...request.body,
            id: ping.id,
            createdAt: ping.createdAt.toISOString(),
        });
    } catch (error) {
        request.log.error(error, "Failed to create telemetry ping");
        throw error;
    }
}

export async function getDevicesStatusHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    request.log.info("Fetching devices status");

    try {
        const devicesStatus = await getDevicesStatus();

        request.log.info({ count: devicesStatus.length }, "Devices status retrieved");
        console.log("devicesStatus", devicesStatus);
        console.log("Response type:", typeof devicesStatus);             // should be "object"
        console.log("Is array:", Array.isArray(devicesStatus));          // should be true
        console.log("Stringified:", JSON.stringify(devicesStatus, null, 2)); // see actual data

        return reply.code(200).type("application/json").send(devicesStatus);
    } catch (error) {
        request.log.error(error, "Failed to fetch devices status");
        throw error;
    }
}