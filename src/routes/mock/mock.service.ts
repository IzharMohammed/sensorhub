import { nanoid } from "nanoid";
import { config } from "../../utils/config";
import { logger } from "../../utils/logger";

interface PaymentRequest {
    subscriptionId: string;
    planId: string;
    amount: number;
}

interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    error?: string;
}

interface RelayRequest {
    idempotencyKey: string;
    message: string;
    meta: Record<string, any>;
}

interface RelayResponse {
    success: boolean;
    error?: string;
}

export async function callMockPaymentProvider(request: PaymentRequest): Promise<PaymentResponse> {
    logger.info({ subscriptionId: request.subscriptionId }, "Calling mock payment provider");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate random failures based on config
    const shouldFail = Math.random() < config.mockPaymentFailureRate;

    if (shouldFail) {
        const errors = [
            "Insufficient funds",
            "Card declined",
            "Payment processor timeout",
            "Invalid payment method",
        ];

        const error = errors[Math.floor(Math.random() * errors.length)];

        logger.warn({ subscriptionId: request.subscriptionId, error }, "Mock payment failed");

        return {
            success: false,
            error,
        };
    }

    const transactionId = `txn_${nanoid(10)}`;

    logger.info({
        subscriptionId: request.subscriptionId,
        transactionId
    }, "Mock payment successful");

    return {
        success: true,
        transactionId,
    };
}

export async function callMockRelayProvider(request: RelayRequest): Promise<RelayResponse> {
    logger.info({ idempotencyKey: request.idempotencyKey }, "Calling mock relay provider");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    // Simulate random failures based on config
    const shouldFail = Math.random() < config.mockRelayFailureRate;

    if (shouldFail) {
        const errors = [
            "Downstream service unavailable",
            "Network timeout",
            "Rate limit exceeded",
            "Invalid message format",
        ];

        const error = errors[Math.floor(Math.random() * errors.length)];

        logger.warn({ idempotencyKey: request.idempotencyKey, error }, "Mock relay failed");

        return {
            success: false,
            error,
        };
    }

    logger.info({ idempotencyKey: request.idempotencyKey }, "Mock relay successful");

    return {
        success: true,
    };
}