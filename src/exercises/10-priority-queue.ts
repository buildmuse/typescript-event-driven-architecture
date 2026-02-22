/**
 * ═══════════════════════════════════════════════
 * EXERCISE 10: Priority Event Queue
 * ═══════════════════════════════════════════════
 * 
 * Process events in priority order (lower number = higher priority).
 * Within same priority, FIFO order.
 */

interface PriorityItem<T> { data: T; priority: number; }

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class PriorityEventQueue<T> {
  enqueue(data: T, priority: number): void {
    // TODO: add item with priority
    throw new Error("Not implemented");
  }

  dequeue(): T | undefined {
    // TODO: remove and return highest priority item (lowest number)
    // FIFO within same priority
    throw new Error("Not implemented");
  }

  async processAll(handler: (item: T) => Promise<void>): Promise<void> {
    // TODO: process all items in priority order
    throw new Error("Not implemented");
  }

  get size(): number { throw new Error("Not implemented"); }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Dequeue in priority order
  const q = new PriorityEventQueue<string>();
  q.enqueue("low", 10);
  q.enqueue("critical", 1);
  q.enqueue("normal", 5);
  q.enqueue("high", 2);

  const order = [q.dequeue(), q.dequeue(), q.dequeue(), q.dequeue()];
  results.push(
    order.join(",") === "critical,high,normal,low"
      ? "✅ T1: Priority order"
      : `❌ T1: got [${order}]`
  );

  // T2: FIFO within same priority
  const q2 = new PriorityEventQueue<string>();
  q2.enqueue("first", 1);
  q2.enqueue("second", 1);
  q2.enqueue("third", 1);
  results.push(
    q2.dequeue() === "first" && q2.dequeue() === "second"
      ? "✅ T2: FIFO within priority"
      : "❌ T2: FIFO within priority"
  );

  // T3: processAll
  const q3 = new PriorityEventQueue<string>();
  const processed: string[] = [];
  q3.enqueue("C", 3);
  q3.enqueue("A", 1);
  q3.enqueue("B", 2);
  await q3.processAll(async (item) => { processed.push(item); });
  results.push(processed.join(",") === "A,B,C" ? "✅ T3: processAll order" : `❌ T3: [${processed}]`);

  // T4: size
  const q4 = new PriorityEventQueue<number>();
  q4.enqueue(1, 1);
  q4.enqueue(2, 2);
  results.push(q4.size === 2 ? "✅ T4: Size" : "❌ T4: Size");
  q4.dequeue();
  results.push(q4.size === 1 ? "✅ T5: Size after dequeue" : "❌ T5: Size after dequeue");

  // T6: dequeue empty returns undefined
  const q5 = new PriorityEventQueue<string>();
  results.push(q5.dequeue() === undefined ? "✅ T6: Empty dequeue" : "❌ T6: Empty dequeue");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
