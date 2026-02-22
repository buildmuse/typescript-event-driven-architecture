/**
 * ============================================================
 * CONCEPT 12: Dead Letter Queue (DLQ)
 * ============================================================
 * 
 * Where failed messages go for later inspection/reprocessing.
 * Java Parallel: SQS DLQ, RabbitMQ Dead Letter Exchange
 */

console.log("═══ Dead Letter Queue ═══\n");

interface QueueMessage {
  id: string;
  payload: any;
  attempts: number;
  maxAttempts: number;
  errors: string[];
}

class MessageQueue {
  private main: QueueMessage[] = [];
  private dlq: QueueMessage[] = [];

  enqueue(payload: any, maxAttempts = 3): void {
    this.main.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      payload,
      attempts: 0,
      maxAttempts,
      errors: [],
    });
  }

  async processAll(handler: (msg: QueueMessage) => Promise<void>): Promise<void> {
    while (this.main.length > 0) {
      const msg = this.main.shift()!;
      msg.attempts++;

      try {
        await handler(msg);
        console.log(`  ✅ Processed: ${msg.id}`);
      } catch (err: any) {
        msg.errors.push(err.message);
        console.log(`  ⚠ Attempt ${msg.attempts}/${msg.maxAttempts}: ${err.message}`);

        if (msg.attempts >= msg.maxAttempts) {
          this.dlq.push(msg);
          console.log(`  💀 → DLQ: ${msg.id}`);
        } else {
          this.main.push(msg); // Re-enqueue for retry
        }
      }
    }
  }

  // Reprocess DLQ messages
  async reprocessDLQ(handler: (msg: QueueMessage) => Promise<void>): Promise<void> {
    console.log(`\n  🔄 Reprocessing ${this.dlq.length} DLQ messages...`);
    const items = [...this.dlq];
    this.dlq = [];

    for (const msg of items) {
      msg.attempts = 0; // Reset attempts
      msg.errors = [];
      this.main.push(msg);
    }

    await this.processAll(handler);
  }

  get dlqSize(): number { return this.dlq.length; }
  get mainSize(): number { return this.main.length; }
  getDLQMessages(): QueueMessage[] { return [...this.dlq]; }
}

(async () => {
  const queue = new MessageQueue();

  // Enqueue messages - some will fail
  queue.enqueue({ orderId: "ORD-001", action: "process" });
  queue.enqueue({ orderId: "ORD-002", action: "INVALID" }); // Will fail
  queue.enqueue({ orderId: "ORD-003", action: "process" });
  queue.enqueue({ orderId: null, action: "process" }); // Will fail

  let processCount = 0;
  await queue.processAll(async (msg) => {
    if (msg.payload.action === "INVALID") throw new Error("Invalid action");
    if (!msg.payload.orderId) throw new Error("Missing orderId");
    processCount++;
  });

  console.log(`\n  Main: ${queue.mainSize}, DLQ: ${queue.dlqSize}`);

  // Inspect DLQ
  console.log(`\n  DLQ Contents:`);
  queue.getDLQMessages().forEach((msg) => {
    console.log(`    ${msg.id}: ${msg.errors.join(", ")}`);
  });

  console.log("\n✅ Concept 12 Complete! Run: npm run concept:event-replay");
})();
