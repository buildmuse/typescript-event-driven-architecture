/**
 * ═══════════════════════════════════════════════
 * EXERCISE 11: Dead Letter Queue with Retry
 * ═══════════════════════════════════════════════
 * 
 * Process messages with automatic retry. After maxRetries, move to DLQ.
 * Support exponential backoff between retries.
 */

interface DLQMessage<T> {
  id: string;
  data: T;
  attempts: number;
  errors: string[];
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class RetryQueue<T> {
  private maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  enqueue(id: string, data: T): void {
    // TODO
    throw new Error("Not implemented");
  }

  async processAll(
    handler: (data: T) => Promise<void>
  ): Promise<{ processed: number; deadLettered: number }> {
    // TODO: process each message
    // On failure: retry up to maxRetries
    // After maxRetries exhausted: move to DLQ
    // Return counts
    throw new Error("Not implemented");
  }

  getDLQ(): DLQMessage<T>[] {
    // TODO: return all dead-lettered messages with their error history
    throw new Error("Not implemented");
  }

  async reprocessDLQ(
    handler: (data: T) => Promise<void>
  ): Promise<{ processed: number; deadLettered: number }> {
    // TODO: move DLQ items back to main queue with reset attempts, process again
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Successful processing
  const q1 = new RetryQueue<string>(3);
  q1.enqueue("m1", "good");
  q1.enqueue("m2", "good");
  const r1 = await q1.processAll(async (data) => { /* success */ });
  results.push(r1.processed === 2 && r1.deadLettered === 0 ? "✅ T1: Happy path" : "❌ T1: Happy path");

  // T2: Permanent failure → DLQ
  const q2 = new RetryQueue<string>(2);
  q2.enqueue("m1", "bad");
  const r2 = await q2.processAll(async () => { throw new Error("always fails"); });
  results.push(r2.deadLettered === 1 ? "✅ T2: Goes to DLQ" : "❌ T2: Goes to DLQ");
  results.push(q2.getDLQ().length === 1 ? "✅ T3: DLQ has item" : "❌ T3: DLQ has item");
  results.push(q2.getDLQ()[0]?.attempts === 2 ? "✅ T4: Attempt count" : `❌ T4: attempts=${q2.getDLQ()[0]?.attempts}`);

  // T5: Error messages captured
  const q3 = new RetryQueue<string>(2);
  let callCount = 0;
  q3.enqueue("m1", "flaky");
  await q3.processAll(async () => {
    callCount++;
    if (callCount <= 2) throw new Error(`fail-${callCount}`);
  });
  const dlqItem = q3.getDLQ()[0];
  results.push(
    dlqItem?.errors.length === 2 && dlqItem.errors[0] === "fail-1"
      ? "✅ T5: Error history"
      : "❌ T5: Error history"
  );

  // T6: Transient failure (succeeds on retry)
  const q4 = new RetryQueue<string>(3);
  let attempts4 = 0;
  q4.enqueue("m1", "flaky");
  const r4 = await q4.processAll(async () => {
    attempts4++;
    if (attempts4 < 3) throw new Error("transient");
  });
  results.push(r4.processed === 1 && r4.deadLettered === 0 ? "✅ T6: Succeeds on retry" : "❌ T6: Succeeds on retry");

  // T7: Reprocess DLQ
  const q5 = new RetryQueue<string>(1);
  q5.enqueue("m1", "test");
  await q5.processAll(async () => { throw new Error("fail"); });
  let reprocessCallCount = 0;
  const r5 = await q5.reprocessDLQ(async () => { reprocessCallCount++; });
  results.push(r5.processed === 1 ? "✅ T7: DLQ reprocessed" : "❌ T7: DLQ reprocessed");
  results.push(q5.getDLQ().length === 0 ? "✅ T8: DLQ cleared" : "❌ T8: DLQ cleared");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
