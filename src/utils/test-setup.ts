import { afterAll, beforeAll, beforeEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.relayLog.deleteMany();
  await prisma.telemetryPing.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.device.deleteMany();
  await prisma.client.deleteMany();
});

// Make prisma available globally in tests
global.prisma = prisma;

declare global {
  var prisma: PrismaClient;
}