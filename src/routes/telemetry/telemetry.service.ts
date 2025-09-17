import { prisma } from "../../utils/prisma";
import { CreateTelemetryPingInput } from "./telemetry.schema";

export async function isDeviceActive(deviceId: string): Promise<boolean | undefined> {
    const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: {
            subscriptions: {
                where: {
                    status: "ACTIVE",
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
            },
        },
    });

    return device?.isActive && device.subscriptions.length > 0;
}

export async function getTelemetryPingByEventId(eventId: string) {
    return prisma.telemetryPing.findUnique({
        where: { eventId },
    });
}

export async function createTelemetryPing(data: CreateTelemetryPingInput) {
    const ts = new Date(data.ts);

    // Start a transaction to create ping and update device
    const result = await prisma.$transaction(async (tx) => {
        // Create the telemetry ping
        const ping = await tx.telemetryPing.create({
            data: {
                eventId: data.eventId,
                deviceId: data.deviceId,
                metric: data.metric,
                value: data.value,
                status: data.status,
                ts,
            },
        });

        // Update device last seen
        await tx.device.update({
            where: { id: data.deviceId },
            data: { lastSeenAt: new Date() },
        });

        return ping;
    });

    return result;
}

export async function getDevicesStatus() {
    const devices = await prisma.device.findMany({
        include: {
            telemetryPings: {
                orderBy: { createdAt: "desc" },
                take: 10, // Get latest 10 metrics per device
            },
        },
    });

    return devices.map((device) => ({
        deviceId: device.id,
        isActive: device.isActive,
        lastSeenAt: device.lastSeenAt?.toISOString() || null,
        latestMetrics: device.telemetryPings.map((ping) => ({
            metric: ping.metric,
            value: ping.value,
            status: ping.status,
            ts: ping.ts.toISOString(),
        })),
    }));
}