/**
 * ============================================================
 * CONCEPT 17: Event Streams (Async Iterables)
 * ============================================================
 * 
 * Process events as async streams with for-await-of.
 * Java Parallel: Java 9 Flow API, Reactor Flux
 */

console.log("═══ Event Streams ═══\n");

// ─────────────────────────────────────────────
// 1. ASYNC ITERABLE EVENT STREAM
// ─────────────────────────────────────────────

class EventStream<T> implements AsyncIterable<T> {
  private buffer: T[] = [];
  private resolve?: (value: IteratorResult<T>) => void;
  private done = false;

  push(value: T): void {
    if (this.resolve) {
      this.resolve({ value, done: false });
      this.resolve = undefined;
    } else {
      this.buffer.push(value);
    }
  }

  end(): void {
    this.done = true;
    if (this.resolve) {
      this.resolve({ value: undefined as any, done: true });
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: (): Promise<IteratorResult<T>> => {
        if (this.buffer.length > 0) {
          return Promise.resolve({ value: this.buffer.shift()!, done: false });
        }
        if (this.done) {
          return Promise.resolve({ value: undefined as any, done: true });
        }
        return new Promise((resolve) => { this.resolve = resolve; });
      },
    };
  }

  // Stream operators
  map<R>(transform: (value: T) => R): EventStream<R> {
    const output = new EventStream<R>();
    (async () => {
      for await (const item of this) {
        output.push(transform(item));
      }
      output.end();
    })();
    return output;
  }

  filter(predicate: (value: T) => boolean): EventStream<T> {
    const output = new EventStream<T>();
    (async () => {
      for await (const item of this) {
        if (predicate(item)) output.push(item);
      }
      output.end();
    })();
    return output;
  }

  batch(size: number): EventStream<T[]> {
    const output = new EventStream<T[]>();
    (async () => {
      let batch: T[] = [];
      for await (const item of this) {
        batch.push(item);
        if (batch.length >= size) {
          output.push(batch);
          batch = [];
        }
      }
      if (batch.length > 0) output.push(batch);
      output.end();
    })();
    return output;
  }
}

(async () => {
  // Basic stream consumption
  const stream = new EventStream<number>();

  // Producer
  setTimeout(() => {
    for (let i = 1; i <= 5; i++) stream.push(i);
    stream.end();
  }, 0);

  // Consumer with for-await-of
  console.log("── Basic Stream ──");
  for await (const value of stream) {
    console.log(`  Received: ${value}`);
  }

  // Stream with operators
  console.log("\n── Stream with Operators ──");
  const dataStream = new EventStream<number>();
  
  setTimeout(() => {
    for (let i = 1; i <= 10; i++) dataStream.push(i);
    dataStream.end();
  }, 0);

  const processed = dataStream
    .filter((n) => n % 2 === 0)
    .map((n) => n * 10);

  for await (const value of processed) {
    console.log(`  Processed: ${value}`);
  }

  // Batched processing
  console.log("\n── Batched Stream ──");
  const batchStream = new EventStream<string>();
  
  setTimeout(() => {
    for (let i = 1; i <= 7; i++) batchStream.push(`event-${i}`);
    batchStream.end();
  }, 0);

  for await (const batch of batchStream.batch(3)) {
    console.log(`  Batch: [${batch.join(", ")}]`);
  }

  console.log("\n✅ Concept 17 Complete! Run: npm run concept:websocket");
})();
