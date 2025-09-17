import { FastifyInstance } from "fastify";
import { mockPaymentChargeHandler, mockRelayReceiveHandler } from "./mock.controller";

async function mockRoutes(server: FastifyInstance) {
  // Determine which mock endpoint to register based on prefix
  const prefix = server.prefix;

  if (prefix === "/mock-pay") {
    // POST /mock-pay/charge
    server.post("/charge", {
      schema: {
        body: {
          type: "object",
          required: ["subscriptionId", "planId", "amount"],
          properties: {
            subscriptionId: { type: "string" },
            planId: { type: "string" },
            amount: { type: "number" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              transactionId: { type: "string" },
              message: { type: "string" },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    }, mockPaymentChargeHandler);
  }

  if (prefix === "/mock-relay") {
    // POST /mock-relay/receive
    server.post("/receive", {
      schema: {
        body: {
          type: "object",
          required: ["idempotencyKey", "message"],
          properties: {
            idempotencyKey: { type: "string" },
            message: { type: "string" },
            meta: { type: "object" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              receivedAt: { type: "string" },
            },
          },
          503: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    }, mockRelayReceiveHandler);
  }
}

export default mockRoutes;