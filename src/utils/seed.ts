import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    // Create test devices
    const device1 = await prisma.device.upsert({
        where: { id: "device_test_1" },
        update: {},
        create: {
            id: "device_test_1",
            name: "Temperature Sensor 001",
            isActive: false,
        },
    });

    const device2 = await prisma.device.upsert({
        where: { id: "device_test_2" },
        update: {},
        create: {
            id: "device_test_2",
            name: "Pressure Sensor 002",
            isActive: false,
        },
    });

    const device3 = await prisma.device.upsert({
        where: { id: "device_test_3" },
        update: {},
        create: {
            id: "device_test_3",
            name: "Humidity Sensor 003",
            isActive: true,
        },
    });

    // Create an active subscription for device3
    const now = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await prisma.subscription.upsert({
        where: { id: "sub_test_1" },
        update: {},
        create: {
            id: "sub_test_1",
            deviceId: device3.id,
            planId: "premium",
            status: "ACTIVE",
            startDate: now,
            endDate: endDate,
            providerRef: "txn_seed_001",
        },
    });

    // Create test clients
    const client1 = await prisma.client.upsert({
        where: { id: "client_test_1" },
        update: {},
        create: {
            id: "client_test_1",
            name: "Test Client 1",
            apiKey: "test_key_12345",
            isActive: true,
        },
    });

    const client2 = await prisma.client.upsert({
        where: { id: "client_test_2" },
        update: {},
        create: {
            id: "client_test_2",
            name: "Test Client 2",
            apiKey: "test_key_67890",
            isActive: true,
        },
    });

    // Create some sample telemetry data for device3
    const sampleTelemetry = [
        {
            eventId: `event_${nanoid(8)}`,
            deviceId: device3.id,
            metric: "temperature",
            value: 23.5,
            status: "ok",
            ts: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
        {
            eventId: `event_${nanoid(8)}`,
            deviceId: device3.id,
            metric: "humidity",
            value: 65.2,
            status: "ok",
            ts: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        },
        {
            eventId: `event_${nanoid(8)}`,
            deviceId: device3.id,
            metric: "temperature",
            value: 28.1,
            status: "warning",
            ts: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        },
    ];

    for (const telemetry of sampleTelemetry) {
        await prisma.telemetryPing.upsert({
            where: { eventId: telemetry.eventId },
            update: {},
            create: telemetry,
        });
    }

    console.log("✅ Seed completed successfully!");
    console.log("\n📋 Test Data Created:");
    console.log(`🔧 Devices: ${device1.name}, ${device2.name}, ${device3.name} (active)`);
    console.log(`👥 Clients: ${client1.name}, ${client2.name}`);
    console.log(`🔑 API Keys: ${client1.apiKey}, ${client2.apiKey}`);
    console.log(`📊 Sample telemetry data added for ${device3.name}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });