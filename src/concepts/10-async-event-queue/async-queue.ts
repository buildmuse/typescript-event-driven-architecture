/**
 * ============================================================
 * CONCEPT 10: Async Event Queue
 * ============================================================
 * 
 * Process events asynchronously with controlled concurrency.
 * Like Java's BlockingQueue + ThreadPoolExecutor.
 * 
 * Key: Decouple event production from consumption.
 */

console.log("═══ Async Event Queue ═══\n");

// ─────────────────────────────────────────────
// 1. BASIC ASYNC QUEUE
// ─────────────────────────────────────────────

class AsyncQueue<T> {
  private queue: T[] = [];
  private processing = false;
  private concurrency: number;
  private activeWorkers = 0;
  private handler?: (item: T) => Promise<void>;

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  onProcess(handler: (item: T) => Promise<void>): void {
    this.handler = handler;
  }

  enqueue(item: T): void {
    this.queue.push(item);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (!this.handler) return;
    if (this.activeWorkers >= this.concurrency) return;
    if (this.queue.length === 0) return;

    this.activeWorkers++;
    const item = this.queue.shift()!;

    try {
      await this.handler(item);
    } catch (err: any) {
      console.log(`  ⚠ Error processing: ${err.message}`);
    }

    this.activeWorkers--;
    this.processNext();
  }

  get size(): number { return this.queue.length; }
  get active(): number { return this.activeWorkers; }
}

const queue = new AsyncQueue<{ id: number; task: string }>(3); // 3 concurrent workers

queue.onProcess(async (item) => {
  console.log(`  ▶ Processing #${item.id}: ${item.task}`);
  await new Promise((r) => setTimeout(r, Math.random() * 200));
  console.log(`  ✅ Done #${item.id}`);
});

// Enqueue 8 items - processed 3 at a time
for (let i = 1; i <= 8; i++) {
  queue.enqueue({ id: i, task: `Task-${i}` });
}

// ─────────────────────────────────────────────
// 2. PRIORITY QUEUE
// ─────────────────────────────────────────────

class PriorityQueue<T> {
  private queues: Map<number, T[]> = new Map();
  private handler?: (item: T) => Promise<void>;
  private processing = false;

  onProcess(handler: (item: T) => Promise<void>): void {
    this.handler = handler;
  }

  enqueue(item: T, priority: number = 5): void {
    if (!this.queues.has(priority)) {
      this.queues.set(priority, []);
    }
    this.queues.get(priority)!.push(item);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || !this.handler) return;
    this.processing = true;

    while (true) {
      const item = this.dequeueHighest();
      if (!item) break;
      await this.handler(item);
    }

    this.processing = false;
  }

  private dequeueHighest(): T | undefined {
    const priorities = Array.from(this.queues.keys()).sort((a, b) => a - b);
    for (const p of priorities) {
      const queue = this.queues.get(p)!;
      if (queue.length > 0) return queue.shift();
    }
    return undefined;
  }
}

setTimeout(async () => {
  console.log("\n═══ Priority Queue ═══\n");

  const pq = new PriorityQueue<{ name: string }>();
  pq.onProcess(async (item) => {
    console.log(`  Processing: ${item.name}`);
  });

  pq.enqueue({ name: "Low-priority-1" }, 10);
  pq.enqueue({ name: "Critical-1" }, 1);
  pq.enqueue({ name: "Normal-1" }, 5);
  pq.enqueue({ name: "Critical-2" }, 1);
  pq.enqueue({ name: "Low-priority-2" }, 10);

  setTimeout(() => {
    console.log("\n✅ Concept 10 Complete! Run: npm run concept:backpressure");
  }, 500);
}, 2000);
