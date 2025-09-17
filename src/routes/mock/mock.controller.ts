import { FastifyReply, FastifyRequest } from "fastify";
import { callMockPaymentProvider, callMockRelayProvider } from "./mock.service";
import { config } from "../../utils/config";

export async function mockPaymentChargeHandler(
  request: FastifyRequest<{
    Body: {
      subscriptionId: string;
      planId: string;
      amount: number;
    };
  }>,
  reply: FastifyReply
) {
  const { subscriptionId, planId, amount } = request.body;

  request.log.info({ subscriptionId, planId, amount }, "Mock payment charge request");

  try {
    const result = await callMockPaymentProvider({
      subscriptionId,
      planId,
      amount,
    });

    if (result.success) {
      return reply.code(200).send({
        success: true,
        transactionId: result.transactionId,
        message: "Payment processed successfully",
      });
    } else {
      return reply.code(400).send({
        success: false,
        error: result.error,
        message: "Payment failed",
      });
    }
  } catch (error) {
    request.log.error(error, "Mock payment provider error");
    return reply.code(500).send({
      success: false,
      error: "Internal payment provider error",
      message: "Payment processing unavailable",
    });
  }
}

export async function mockRelayReceiveHandler(
  request: FastifyRequest<{
    Body: {
      idempotencyKey: string;
      message: string;
      meta?: Record<string, any>;
    };
  }>,
  reply: FastifyReply
) {
  const { idempotencyKey, message, meta } = request.body;

  request.log.info({ idempotencyKey }, "Mock relay receive request");

  try {
    const result = await callMockRelayProvider({
      idempotencyKey,
      message,
      meta: meta || {},
    });

    if (result.success) {
      return reply.code(200).send({
        success: true,
        message: "Message received successfully",
        receivedAt: new Date().toISOString(),
      });
    } else {
      // Return 5xx error to trigger retries
      return reply.code(503).send({
        success: false,
        error: result.error,
        message: "Service temporarily unavailable",
      });
    }
  } catch (error) {
    request.log.error(error, "Mock relay provider error");
    return reply.code(500).send({
      success: false,
      error: "Internal relay provider error",
      message: "Relay service unavailable",
    });
  }
}