import { prisma } from "../../utils/prisma";
import { CreateSubscriptionInput } from "./billing.schema";
import { callMockPaymentProvider } from "../mock/mock.service";

export async function createSubscription(data: CreateSubscriptionInput) {
    const subscription = await prisma.subscription.create({
        data: {
            deviceId: data.deviceId,
            planId: data.planId,
            status: "PENDING",
        },
    });

    return subscription;
}

export async function processPayment(subscriptionId: string, planId: string) {
    try {
        // Call mock payment provider
        const paymentResult = await callMockPaymentProvider({
            subscriptionId,
            planId,
            amount: getPlanAmount(planId),
        });

        // Calculate subscription dates (1 year from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        // Update subscription with payment result
        const subscription = await prisma.$transaction(async (tx) => {
            const updatedSubscription = await tx.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: paymentResult.success ? "ACTIVE" : "PENDING",
                    startDate: paymentResult.success ? startDate : null,
                    endDate: paymentResult.success ? endDate : null,
                    providerRef: paymentResult.transactionId,
                },
            });

            // If payment successful, activate the device
            if (paymentResult.success) {
                await tx.device.update({
                    where: { id: updatedSubscription.deviceId },
                    data: { isActive: true },
                });
            }

            return updatedSubscription;
        });

        return {
            subscription,
            paymentSuccess: paymentResult.success,
            error: paymentResult.error,
        };
    } catch (error) {
        // Update subscription status to reflect payment failure
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "PENDING" },
        });

        throw error;
    }
}

export async function getSubscription(id: string) {
    return prisma.subscription.findUnique({
        where: { id },
    });
}

export async function checkExpiredSubscriptions() {
    const now = new Date();

    // Find all active subscriptions that have expired
    const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
            status: "ACTIVE",
            endDate: { lt: now },
        },
        include: { device: true },
    });

    // Update expired subscriptions and deactivate devices
    for (const subscription of expiredSubscriptions) {
        await prisma.$transaction(async (tx) => {
            // Update subscription status
            await tx.subscription.update({
                where: { id: subscription.id },
                data: { status: "EXPIRED" },
            });

            // Check if device has any other active subscriptions
            const activeSubscriptions = await tx.subscription.count({
                where: {
                    deviceId: subscription.deviceId,
                    status: "ACTIVE",
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            });

            // If no active subscriptions, deactivate device
            if (activeSubscriptions === 0) {
                await tx.device.update({
                    where: { id: subscription.deviceId },
                    data: { isActive: false },
                });
            }
        });
    }

    return expiredSubscriptions.length;
}

function getPlanAmount(planId: string): number {
    // Mock plan pricing
    const plans = {
        "basic": 99.99,
        "premium": 199.99,
        "enterprise": 499.99,
    };

    return plans[planId as keyof typeof plans] || 99.99;
}