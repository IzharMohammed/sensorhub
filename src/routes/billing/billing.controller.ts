import { FastifyReply, FastifyRequest } from "fastify";
import { CreateSubscriptionInput } from "./billing.schema";
import { createSubscription, processPayment } from "./billing.service";

export async function createSubscriptionHandler(
    request: FastifyRequest<{
        Body: CreateSubscriptionInput;
    }>,
    reply: FastifyReply
) {
    const { deviceId, planId } = request.body;

    request.log.info({ deviceId, planId }, "Creating subscription");

    try {
        // Create the subscription first
        const subscription = await createSubscription(request.body);

        request.log.info(
            { subscriptionId: subscription.id },
            "Subscription created, processing payment"
        );

        // Process the payment
        const paymentResult = await processPayment(subscription.id, planId);

        if (paymentResult.paymentSuccess) {
            request.log.info(
                { subscriptionId: subscription.id },
                "Payment successful, subscription activated"
            );

            return reply.code(201).send({
                ...request.body,
                id: paymentResult.subscription.id,
                status: paymentResult.subscription.status,
                startDate: paymentResult.subscription.startDate?.toISOString() || null,
                endDate: paymentResult.subscription.endDate?.toISOString() || null,
                providerRef: paymentResult.subscription.providerRef,
                createdAt: paymentResult.subscription.createdAt.toISOString(),
                updatedAt: paymentResult.subscription.updatedAt.toISOString(),
            });
        } else {
            request.log.warn(
                { subscriptionId: subscription.id, error: paymentResult.error },
                "Payment failed"
            );

            return reply.code(402).send({
                error: "Payment Failed",
                message: paymentResult.error || "Payment processing failed",
                requestId: request.id,
            });
        }
    } catch (error) {
        request.log.error(error, "Failed to create subscription");

        throw error;
    }
}