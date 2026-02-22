/**
 * ============================================================
 * CONCEPT 11: Backpressure
 * ============================================================
 * 
 * When producer is faster than consumer.
 * Strategies: buffer, drop, throttle, signal back.
 * 
 * Java Parallel: Reactor Flux backpressure, RxJava Flowable
 */

console.log("═══ Backpressure Strategies ═══\n");

// ─────────────────────────────────────────────
// 1. BOUNDED BUFFER (Drop oldest when full)
// ─────────────────────────────────────────────

class BoundedBuffer<T> {
  private buffer: T[] = [];
  private dropped = 0;

  constructor(
    private maxSize: number,
    private strategy: "drop-oldest" | "drop-newest" | "block" = "drop-oldest"
  ) {}

  push(item: T): boolean {
    if (this.buffer.length >= this.maxSize) {
      switch (this.strategy) {
        case "drop-oldest":
          this.buffer.shift();
          this.dropped++;
          this.buffer.push(item);
          return true;
        case "drop-newest":
          this.dropped++;
          return false; // Reject new item
        case "block":
          return false; // Signal to slow down
      }
    }
    this.buffer.push(item);
    return true;
  }

  pull(): T | undefined {
    return this.buffer.shift();
  }

  get size(): number { return this.buffer.length; }
  get droppedCount(): number { return this.dropped; }
}

// Simulate fast producer, slow consumer
const buffer = new BoundedBuffer<number>(5, "drop-oldest");

// Producer: adds 20 items instantly
for (let i = 1; i <= 20; i++) {
  buffer.push(i);
}

console.log(`  Buffer size: ${buffer.size}, Dropped: ${buffer.droppedCount}`);
console.log(`  Remaining items: ${Array.from({ length: buffer.size }, () => buffer.pull())}`);

// ─────────────────────────────────────────────
// 2. PULL-BASED (Consumer controls pace)
// ─────────────────────────────────────────────

console.log("\n═══ Pull-Based Backpressure ═══\n");

class PullStream<T> {
  private buffer: T[] = [];
  private waitingConsumer: ((value: T) => void) | null = null;

  // Producer pushes
  push(item: T): void {
    if (this.waitingConsumer) {
      this.waitingConsumer(item);
      this.waitingConsumer = null;
    } else {
      this.buffer.push(item);
    }
  }

  // Consumer pulls (async - waits if empty)
  async pull(): Promise<T> {
    if (this.buffer.length > 0) {
      return this.buffer.shift()!;
    }
    return new Promise<T>((resolve) => {
      this.waitingConsumer = resolve;
    });
  }

  get pending(): number { return this.buffer.length; }
}

(async () => {
  const stream = new PullStream<string>();

  // Producer
  const produce = async () => {
    for (let i = 1; i <= 5; i++) {
      stream.push(`item-${i}`);
      console.log(`  Produced: item-${i} (buffer: ${stream.pending})`);
    }
  };

  // Consumer (slower)
  const consume = async () => {
    for (let i = 1; i <= 5; i++) {
      const item = await stream.pull();
      console.log(`  Consumed: ${item}`);
      await new Promise((r) => setTimeout(r, 50));
    }
  };

  await Promise.all([produce(), consume()]);

  // ─────────────────────────────────────────────
  // 3. TOKEN BUCKET (Rate-based backpressure)
  // ─────────────────────────────────────────────
  console.log("\n═══ Token Bucket Backpressure ═══\n");

  class TokenBucket {
    private tokens: number;
    private lastRefill: number;

    constructor(
      private capacity: number,
      private refillRate: number, // tokens per second
    ) {
      this.tokens = capacity;
      this.lastRefill = Date.now();
    }

    private refill(): void {
      const now = Date.now();
      const elapsed = (now - this.lastRefill) / 1000;
      this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
      this.lastRefill = now;
    }

    tryConsume(tokens = 1): boolean {
      this.refill();
      if (this.tokens >= tokens) {
        this.tokens -= tokens;
        return true;
      }
      return false;
    }

    get available(): number {
      this.refill();
      return Math.floor(this.tokens);
    }
  }

  const bucket = new TokenBucket(5, 2); // 5 capacity, 2/sec refill

  // Burst of 8 requests
  for (let i = 1; i <= 8; i++) {
    const allowed = bucket.tryConsume();
    console.log(`  Request ${i}: ${allowed ? "✅ Allowed" : "❌ Rejected"} (tokens: ${bucket.available})`);
  }

  // Wait for refill
  await new Promise((r) => setTimeout(r, 1500));
  console.log(`  After 1.5s: ${bucket.available} tokens available`);

  console.log("\n✅ Concept 11 Complete! Run: npm run concept:dead-letter");
})();
