/**
 * ============================================================
 * CONCEPT 07: Saga Pattern (Orchestration & Choreography)
 * ============================================================
 * 
 * Manage distributed transactions across services using events.
 * If any step fails, compensate (undo) previous steps.
 * 
 * Java Parallel: Spring State Machine, Temporal.io, Axon Saga
 * 
 * Two flavors:
 * 1. Orchestration: Central coordinator directs steps
 * 2. Choreography: Services react to events independently
 */

import { EventEmitter } from "events";

// ─────────────────────────────────────────────
// 1. ORCHESTRATION SAGA - Order Processing
// ─────────────────────────────────────────────
console.log("═══ 1. Orchestration Saga ═══\n");

type SagaStepStatus = "pending" | "completed" | "failed" | "compensated";

interface SagaStep {
  name: string;
  execute: (context: any) => Promise<any>;
  compensate: (context: any) => Promise<void>;
  status: SagaStepStatus;
}

class SagaOrchestrator {
  private steps: SagaStep[] = [];
  private completedSteps: SagaStep[] = [];

  addStep(
    name: string,
    execute: (ctx: any) => Promise<any>,
    compensate: (ctx: any) => Promise<void>
  ): this {
    this.steps.push({ name, execute, compensate, status: "pending" });
    return this;
  }

  async execute(context: any): Promise<{ success: boolean; context: any }> {
    console.log(`  🚀 Saga started`);

    for (const step of this.steps) {
      try {
        console.log(`  ▶ Executing: ${step.name}`);
        const result = await step.execute(context);
        step.status = "completed";
        this.completedSteps.push(step);
        context = { ...context, ...result };
        console.log(`  ✅ ${step.name} completed`);
      } catch (error: any) {
        console.log(`  ❌ ${step.name} FAILED: ${error.message}`);
        step.status = "failed";

        // Compensate in reverse order
        await this.compensate(context);
        return { success: false, context };
      }
    }

    console.log(`  🎉 Saga completed successfully!`);
    return { success: true, context };
  }

  private async compensate(context: any): Promise<void> {
    console.log(`\n  🔄 Starting compensation...`);

    // Reverse order compensation
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const step = this.completedSteps[i];
      try {
        console.log(`  ↩ Compensating: ${step.name}`);
        await step.compensate(context);
        step.status = "compensated";
        console.log(`  ✅ ${step.name} compensated`);
      } catch (err: any) {
        console.log(`  ⚠️ Compensation failed for ${step.name}: ${err.message}`);
        // In production: log to DLQ, alert, manual intervention
      }
    }

    console.log(`  🔄 Compensation complete\n`);
  }
}

// Simulate an order processing saga
const orderSaga = new SagaOrchestrator();

orderSaga
  .addStep(
    "Reserve Inventory",
    async (ctx) => {
      // Simulate inventory check
      if (ctx.quantity > 100) throw new Error("Not enough stock");
      return { reservationId: `RES-${Date.now()}` };
    },
    async (ctx) => {
      console.log(`    Releasing reservation ${ctx.reservationId}`);
    }
  )
  .addStep(
    "Process Payment",
    async (ctx) => {
      // Simulate payment - FAIL for amounts > 5000
      if (ctx.amount > 5000) throw new Error("Payment declined");
      return { paymentId: `PAY-${Date.now()}` };
    },
    async (ctx) => {
      console.log(`    Refunding payment ${ctx.paymentId}`);
    }
  )
  .addStep(
    "Create Shipment",
    async (ctx) => {
      return { trackingId: `TRK-${Date.now()}` };
    },
    async (ctx) => {
      console.log(`    Cancelling shipment ${ctx.trackingId}`);
    }
  )
  .addStep(
    "Send Confirmation",
    async (ctx) => {
      return { emailSent: true };
    },
    async (ctx) => {
      console.log(`    Sending cancellation email`);
    }
  );

(async () => {
  // Success case
  console.log("── Success Case ──");
  const success = await orderSaga.execute({
    orderId: "ORD-001",
    quantity: 5,
    amount: 499.99,
  });
  console.log(`  Result:`, success.success);

  // Failure case - triggers compensation
  console.log("\n── Failure Case (Payment Fails) ──");
  const failSaga = new SagaOrchestrator();
  failSaga
    .addStep(
      "Reserve Inventory",
      async (ctx) => ({ reservationId: "RES-002" }),
      async (ctx) => console.log(`    Released reservation`)
    )
    .addStep(
      "Process Payment",
      async (ctx) => { throw new Error("Insufficient funds"); },
      async (ctx) => console.log(`    Refunded payment`)
    )
    .addStep(
      "Create Shipment",
      async (ctx) => ({ trackingId: "TRK-002" }),
      async (ctx) => console.log(`    Cancelled shipment`)
    );

  const failure = await failSaga.execute({ orderId: "ORD-002", amount: 10000 });
  console.log(`  Result:`, failure.success);

  // ─────────────────────────────────────────────
  // 2. CHOREOGRAPHY SAGA - Services react to events
  // ─────────────────────────────────────────────
  console.log("\n═══ 2. Choreography Saga ═══\n");

  const sagaBus = new EventEmitter();

  // Each service listens and reacts independently
  // No central coordinator!

  // Inventory Service
  sagaBus.on("OrderPlaced", (event: any) => {
    console.log(`  [Inventory] Reserving stock for ${event.orderId}`);
    // On success, emit next event
    sagaBus.emit("InventoryReserved", {
      orderId: event.orderId,
      reservationId: `RES-${Date.now()}`,
    });
  });

  sagaBus.on("PaymentFailed", (event: any) => {
    console.log(`  [Inventory] ↩ Releasing reservation for ${event.orderId}`);
  });

  // Payment Service
  sagaBus.on("InventoryReserved", (event: any) => {
    console.log(`  [Payment] Processing payment for ${event.orderId}`);
    if (Math.random() > 0.3) {
      sagaBus.emit("PaymentProcessed", {
        orderId: event.orderId,
        paymentId: `PAY-${Date.now()}`,
      });
    } else {
      sagaBus.emit("PaymentFailed", {
        orderId: event.orderId,
        reason: "Card declined",
      });
    }
  });

  // Shipping Service
  sagaBus.on("PaymentProcessed", (event: any) => {
    console.log(`  [Shipping] Creating shipment for ${event.orderId}`);
    sagaBus.emit("ShipmentCreated", {
      orderId: event.orderId,
      trackingId: `TRK-${Date.now()}`,
    });
  });

  // Notification Service
  sagaBus.on("ShipmentCreated", (event: any) => {
    console.log(`  [Notification] ✉ Order ${event.orderId} confirmed! Track: ${event.trackingId}`);
  });

  sagaBus.on("PaymentFailed", (event: any) => {
    console.log(`  [Notification] ✉ Order ${event.orderId} failed: ${event.reason}`);
  });

  // Trigger the saga
  sagaBus.emit("OrderPlaced", { orderId: "ORD-100", amount: 299.99 });

  // ─────────────────────────────────────────────
  // 3. SAGA WITH TIMEOUT & RETRY
  // ─────────────────────────────────────────────
  console.log("\n═══ 3. Saga with Timeout & Retry ═══\n");

  class ResilientSagaStep {
    constructor(
      public name: string,
      private fn: (ctx: any) => Promise<any>,
      private compensateFn: (ctx: any) => Promise<void>,
      private maxRetries: number = 3,
      private timeoutMs: number = 5000
    ) {}

    async execute(context: any): Promise<any> {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`    ${this.name} attempt ${attempt}/${this.maxRetries}`);
          
          const result = await Promise.race([
            this.fn(context),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), this.timeoutMs)
            ),
          ]);
          
          return result;
        } catch (error: any) {
          if (attempt === this.maxRetries) {
            throw new Error(`${this.name} failed after ${this.maxRetries} attempts: ${error.message}`);
          }
          console.log(`    ⚠ Retry ${attempt}: ${error.message}`);
          await new Promise((r) => setTimeout(r, 100 * attempt)); // Exponential backoff
        }
      }
    }

    async compensate(context: any): Promise<void> {
      return this.compensateFn(context);
    }
  }

  let callCount = 0;
  const resilientStep = new ResilientSagaStep(
    "Flaky API Call",
    async (ctx) => {
      callCount++;
      if (callCount < 3) throw new Error("Connection refused");
      return { apiResult: "success" };
    },
    async (ctx) => console.log("    Cleaned up"),
    3,
    5000
  );

  const result = await resilientStep.execute({});
  console.log(`  Result:`, result);

  console.log("\n✅ Concept 07 Complete! Run: npm run concept:observer");
})();
