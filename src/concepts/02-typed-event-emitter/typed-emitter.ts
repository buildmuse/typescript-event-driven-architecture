/**
 * ============================================================
 * CONCEPT 02: Typed Event Emitter
 * ============================================================
 * 
 * Why this matters for interviews:
 * - Shows TypeScript mastery (generics, mapped types)
 * - Production code needs type-safe events
 * - Prevents runtime bugs from wrong event payloads
 * 
 * Java Parallel: Like defining event types with generics
 *   interface EventListener<T> { void onEvent(T data); }
 */

import { EventEmitter } from "events";

// ─────────────────────────────────────────────
// 1. TYPE-SAFE EVENT MAP
// ─────────────────────────────────────────────
console.log("═══ 1. Typed Event Emitter ═══\n");

// Define your event contract (like Java interfaces)
interface OrderEvents {
  "order:created": { orderId: string; amount: number; items: string[] };
  "order:paid": { orderId: string; paymentMethod: string };
  "order:shipped": { orderId: string; trackingId: string };
  "order:cancelled": { orderId: string; reason: string };
  "error": Error;
}

// Generic typed emitter - THE KEY PATTERN
class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  once<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): boolean {
    return this.emitter.emit(event as string, payload);
  }

  off<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  removeAllListeners<K extends keyof TEvents>(event?: K): this {
    this.emitter.removeAllListeners(event as string);
    return this;
  }
}

// Usage - Full type safety!
const orderBus = new TypedEventEmitter<OrderEvents>();

orderBus.on("order:created", (data) => {
  // TypeScript knows: data.orderId is string, data.amount is number
  console.log(`Order ${data.orderId} created: $${data.amount}`);
  console.log(`Items: ${data.items.join(", ")}`);
});

orderBus.on("order:shipped", (data) => {
  // TypeScript knows: data.trackingId exists
  console.log(`Order ${data.orderId} shipped. Tracking: ${data.trackingId}`);
});

// This would cause a compile error:
// orderBus.emit("order:created", { orderId: "1", wrongField: true });

orderBus.emit("order:created", {
  orderId: "ORD-001",
  amount: 99.99,
  items: ["Keyboard", "Mouse"],
});

orderBus.emit("order:shipped", {
  orderId: "ORD-001",
  trackingId: "TRK-ABC123",
});

// ─────────────────────────────────────────────
// 2. ASYNC TYPED EMITTER
// ─────────────────────────────────────────────
console.log("\n═══ 2. Async Typed Emitter ═══\n");

class AsyncTypedEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<keyof TEvents, Set<Function>>();

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void | Promise<void>
  ): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  // Emit and WAIT for all async listeners to complete
  async emit<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    // Run all handlers in parallel (like CompletableFuture.allOf())
    await Promise.all(
      Array.from(handlers).map((handler) => handler(payload))
    );
  }

  // Sequential emit - wait for each handler before next
  async emitSequential<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      await handler(payload);
    }
  }
}

interface NotificationEvents {
  "user:signup": { userId: string; email: string };
  "user:login": { userId: string; ip: string };
}

const notifications = new AsyncTypedEmitter<NotificationEvents>();

notifications.on("user:signup", async (data) => {
  // Simulate sending welcome email
  await new Promise((r) => setTimeout(r, 100));
  console.log(`  📧 Welcome email sent to ${data.email}`);
});

notifications.on("user:signup", async (data) => {
  // Simulate creating user profile
  await new Promise((r) => setTimeout(r, 50));
  console.log(`  👤 Profile created for ${data.userId}`);
});

(async () => {
  await notifications.emit("user:signup", {
    userId: "U-001",
    email: "dev@buildmuse.com",
  });
  console.log("  ✅ All signup handlers completed!\n");

  // ─────────────────────────────────────────────
  // 3. EVENT ENVELOPE PATTERN
  // ─────────────────────────────────────────────
  console.log("═══ 3. Event Envelope Pattern ═══\n");

  // Standard envelope for all events (like Kafka message headers)
  interface EventEnvelope<T> {
    id: string;
    timestamp: number;
    source: string;
    correlationId?: string;
    payload: T;
  }

  interface PaymentEvents {
    "payment:initiated": EventEnvelope<{ orderId: string; amount: number }>;
    "payment:completed": EventEnvelope<{ orderId: string; transactionId: string }>;
    "payment:failed": EventEnvelope<{ orderId: string; error: string }>;
  }

  const paymentBus = new TypedEventEmitter<PaymentEvents>();

  paymentBus.on("payment:initiated", (envelope) => {
    console.log(`  [${envelope.source}] Payment initiated`);
    console.log(`    Event ID: ${envelope.id}`);
    console.log(`    Order: ${envelope.payload.orderId}`);
    console.log(`    Amount: $${envelope.payload.amount}`);
    console.log(`    Correlation: ${envelope.correlationId}`);
  });

  const correlationId = `CORR-${Date.now()}`;

  paymentBus.emit("payment:initiated", {
    id: `EVT-${Date.now()}`,
    timestamp: Date.now(),
    source: "payment-service",
    correlationId,
    payload: { orderId: "ORD-001", amount: 149.99 },
  });

  // ─────────────────────────────────────────────
  // 4. DISCRIMINATED UNION EVENTS
  // ─────────────────────────────────────────────
  console.log("\n═══ 4. Discriminated Union Events ═══\n");

  // Single channel, multiple event types (like Java sealed classes)
  type DomainEvent =
    | { type: "USER_CREATED"; userId: string; name: string }
    | { type: "USER_UPDATED"; userId: string; changes: Record<string, any> }
    | { type: "USER_DELETED"; userId: string };

  interface DomainEvents {
    domain: DomainEvent;
  }

  const domainBus = new TypedEventEmitter<DomainEvents>();

  domainBus.on("domain", (event) => {
    switch (event.type) {
      case "USER_CREATED":
        // TypeScript narrows: event has .name
        console.log(`  User created: ${event.name}`);
        break;
      case "USER_UPDATED":
        // TypeScript narrows: event has .changes
        console.log(`  User ${event.userId} updated:`, event.changes);
        break;
      case "USER_DELETED":
        console.log(`  User ${event.userId} deleted`);
        break;
    }
  });

  domainBus.emit("domain", { type: "USER_CREATED", userId: "U-1", name: "Buildmuse" });
  domainBus.emit("domain", { type: "USER_UPDATED", userId: "U-1", changes: { role: "admin" } });

  // ─────────────────────────────────────────────
  // 5. CONDITIONAL TYPE EMITTER (Advanced)
  // ─────────────────────────────────────────────
  console.log("\n═══ 5. Event Filter / Conditional Subscribe ═══\n");

  class FilteredEmitter<TEvents extends Record<string, any>> extends TypedEventEmitter<TEvents> {
    onWhere<K extends keyof TEvents>(
      event: K,
      predicate: (payload: TEvents[K]) => boolean,
      listener: (payload: TEvents[K]) => void
    ): this {
      return this.on(event, (payload) => {
        if (predicate(payload)) {
          listener(payload);
        }
      });
    }
  }

  interface TradeEvents {
    trade: { symbol: string; price: number; quantity: number };
  }

  const tradeBus = new FilteredEmitter<TradeEvents>();

  // Only listen for high-value trades
  tradeBus.onWhere(
    "trade",
    (t) => t.price * t.quantity > 10000,
    (trade) => {
      console.log(`  🚨 High-value trade: ${trade.symbol} $${trade.price * trade.quantity}`);
    }
  );

  // Only listen for specific symbol
  tradeBus.onWhere(
    "trade",
    (t) => t.symbol === "AAPL",
    (trade) => {
      console.log(`  🍎 Apple trade: ${trade.quantity} @ $${trade.price}`);
    }
  );

  tradeBus.emit("trade", { symbol: "AAPL", price: 150, quantity: 100 }); // Both fire
  tradeBus.emit("trade", { symbol: "GOOG", price: 50, quantity: 10 }); // Neither fires
  tradeBus.emit("trade", { symbol: "GOOG", price: 200, quantity: 100 }); // Only high-value

  console.log("\n✅ Concept 02 Complete! Run: npm run concept:pubsub");
})();
