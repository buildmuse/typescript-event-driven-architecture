/**
 * ============================================================
 * CONCEPT 13: Event Replay
 * ============================================================
 * 
 * Replay events to rebuild state, debug, or migrate data.
 * Core capability of event-sourced systems.
 */

console.log("═══ Event Replay ═══\n");

interface StoredEvent {
  id: number;
  type: string;
  data: any;
  timestamp: number;
}

class ReplayableEventStore {
  private events: StoredEvent[] = [];
  private seq = 0;

  append(type: string, data: any): StoredEvent {
    const event: StoredEvent = {
      id: ++this.seq,
      type,
      data,
      timestamp: Date.now(),
    };
    this.events.push(event);
    return event;
  }

  // Replay all events through a handler
  replay(handler: (event: StoredEvent) => void): void {
    for (const event of this.events) {
      handler(event);
    }
  }

  // Replay from a specific point
  replayFrom(afterId: number, handler: (event: StoredEvent) => void): void {
    for (const event of this.events) {
      if (event.id > afterId) handler(event);
    }
  }

  // Replay with transformation (for migrations)
  replayWithTransform(
    transform: (event: StoredEvent) => StoredEvent | null,
    handler: (event: StoredEvent) => void
  ): void {
    for (const event of this.events) {
      const transformed = transform(event);
      if (transformed) handler(transformed);
    }
  }

  get count(): number { return this.events.length; }
}

// Build up event history
const store = new ReplayableEventStore();

store.append("USER_CREATED", { userId: "U1", name: "Alice" });
store.append("ITEM_ADDED", { userId: "U1", item: "Keyboard", price: 150 });
store.append("ITEM_ADDED", { userId: "U1", item: "Mouse", price: 80 });
store.append("ORDER_PLACED", { userId: "U1", total: 230 });
store.append("ITEM_ADDED", { userId: "U1", item: "Monitor", price: 500 });
store.append("ORDER_PLACED", { userId: "U1", total: 500 });

// 1. Full Replay - rebuild state
console.log("── Full Replay ──");
let totalSpent = 0;
store.replay((event) => {
  if (event.type === "ORDER_PLACED") {
    totalSpent += event.data.total;
  }
});
console.log(`  Total spent: $${totalSpent}\n`);

// 2. Partial Replay - from checkpoint
console.log("── Replay from event #3 ──");
store.replayFrom(3, (event) => {
  console.log(`  Event #${event.id}: ${event.type}`);
});

// 3. Replay with transformation (schema migration)
console.log("\n── Replay with Transform (v1 → v2 migration) ──");
store.replayWithTransform(
  (event) => {
    if (event.type === "ITEM_ADDED") {
      // Migrate: add currency field
      return { ...event, data: { ...event.data, currency: "USD" } };
    }
    return event;
  },
  (event) => {
    if (event.type === "ITEM_ADDED") {
      console.log(`  Migrated: ${event.data.item} - ${event.data.currency}$${event.data.price}`);
    }
  }
);

console.log("\n✅ Concept 13 Complete! Run: npm run concept:middleware");
