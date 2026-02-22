/**
 * ═══════════════════════════════════════════════
 * EXERCISE 09: Async Queue with Concurrency Limit
 * ═══════════════════════════════════════════════
 * 
 * Like Java's ThreadPoolExecutor — process N items at a time.
 * 
 * Requirements:
 * - enqueue(item) adds to queue
 * - Process max `concurrency` items simultaneously
 * - When one finishes, pull next from queue
 * - drain() returns a promise that resolves when queue empty AND all workers done
 */

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class AsyncQueue<T> {
  private handler!: (item: T) => Promise<void>;

  constructor(private concurrency: number) {}

  process(handler: (item: T) => Promise<void>): void {
    // TODO: set the handler
    throw new Error("Not implemented");
  }

  enqueue(item: T): void {
    // TODO: add item, start processing if workers available
    throw new Error("Not implemented");
  }

  async drain(): Promise<void> {
    // TODO: resolve when all items processed and no active workers
    throw new Error("Not implemented");
  }

  get pending(): number {
    // TODO: items waiting in queue
    throw new Error("Not implemented");
  }

  get active(): number {
    // TODO: currently processing count
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Concurrency limit respected
  const q1 = new AsyncQueue<number>(2);
  let maxConcurrent = 0;
  let currentActive = 0;

  q1.process(async (n) => {
    currentActive++;
    maxConcurrent = Math.max(maxConcurrent, currentActive);
    await new Promise((r) => setTimeout(r, 50));
    currentActive--;
  });

  for (let i = 0; i < 6; i++) q1.enqueue(i);
  await q1.drain();
  results.push(maxConcurrent <= 2 ? "✅ T1: Concurrency limit" : `❌ T1: maxConcurrent=${maxConcurrent}`);

  // T2: All items processed
  const q2 = new AsyncQueue<number>(3);
  const processed: number[] = [];
  q2.process(async (n) => {
    await new Promise((r) => setTimeout(r, 10));
    processed.push(n);
  });
  for (let i = 1; i <= 5; i++) q2.enqueue(i);
  await q2.drain();
  results.push(processed.length === 5 ? "✅ T2: All items processed" : `❌ T2: processed=${processed.length}`);

  // T3: drain resolves when empty
  const q3 = new AsyncQueue<string>(1);
  q3.process(async () => { await new Promise((r) => setTimeout(r, 10)); });
  q3.enqueue("a");
  q3.enqueue("b");
  await q3.drain();
  results.push(q3.pending === 0 && q3.active === 0 ? "✅ T3: Drain completes" : "❌ T3: Drain completes");

  // T4: pending and active counts
  const q4 = new AsyncQueue<number>(1);
  let checkedPending = -1;
  q4.process(async () => {
    checkedPending = q4.pending;
    await new Promise((r) => setTimeout(r, 50));
  });
  q4.enqueue(1);
  q4.enqueue(2);
  q4.enqueue(3);
  await new Promise((r) => setTimeout(r, 10)); // Let first item start
  results.push(q4.active === 1 ? "✅ T4a: Active count" : `❌ T4a: active=${q4.active}`);
  await q4.drain();
  results.push(checkedPending >= 1 ? "✅ T4b: Pending count" : `❌ T4b: pending was ${checkedPending}`);

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
