/**
 * ═══════════════════════════════════════════════
 * EXERCISE 02c: Discriminated Union Events
 * ═══════════════════════════════════════════════
 *
 * Instead of many event names, use a single "domain" channel
 * with a discriminated union payload. TypeScript narrows the
 * type automatically inside each switch case.
 *
 * Requirements:
 * - Build a DomainEventBus with a single "domain" channel
 * - on("domain", handler) receives all domain events
 * - handler must switch on event.type to narrow the payload
 * - emit("domain", event) dispatches to all handlers
 * - getHistory() returns all emitted events in order
 * - getHistory(type) returns only events of that type
 *
 * Type Safety:
 * - Inside case "USER_CREATED": TypeScript must know event has .name
 * - Inside case "USER_DELETED": TypeScript must know event has only .userId
 */

// ── These types are given ──
type DomainEvent =
  | { type: "USER_CREATED"; userId: string; name: string; email: string }
  | { type: "USER_UPDATED"; userId: string; changes: Record<string, any> }
  | { type: "USER_DELETED"; userId: string }
  | { type: "ORDER_PLACED"; orderId: string; userId: string; amount: number }
  | { type: "ORDER_CANCELLED"; orderId: string; reason: string };

interface DomainEvents {
  domain: DomainEvent;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class DomainEventBus {
  // TODO: internal storage for handlers and history

  on(handler: (event: DomainEvent) => void): () => void {
    // TODO: register handler, return unsubscribe fn
    throw new Error("Not implemented");
  }

  emit(event: DomainEvent): void {
    // TODO: store in history, deliver to all handlers
    throw new Error("Not implemented");
  }

  getHistory(): DomainEvent[];
  getHistory<T extends DomainEvent["type"]>(type: T): Extract<DomainEvent, { type: T }>[];
  getHistory(type?: string): DomainEvent[] {
    // TODO: return all events, or filter by type if provided
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS — Do not modify below this line
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const bus = new DomainEventBus();

  // T1: Handler receives events
  const received: DomainEvent[] = [];
  bus.on((e) => received.push(e));

  bus.emit({ type: "USER_CREATED", userId: "U1", name: "Alice", email: "a@b.com" });
  bus.emit({ type: "ORDER_PLACED", orderId: "O1", userId: "U1", amount: 99 });

  results.push(
    received.length === 2
      ? "✅ T1: Handler receives events"
      : "❌ T1: Handler receives events"
  );

  // T2: Type narrowing works — handler can switch on type
  let narrowed = "";
  bus.on((e) => {
    switch (e.type) {
      case "USER_CREATED": narrowed = e.name; break;
      case "ORDER_PLACED": narrowed = String(e.amount); break;
    }
  });

  bus.emit({ type: "USER_CREATED", userId: "U2", name: "Bob", email: "b@c.com" });
  results.push(
    narrowed === "Bob"
      ? "✅ T2: Type narrowing in switch"
      : "❌ T2: Type narrowing in switch"
  );

  // T3: Unsubscribe works
  let count = 0;
  const unsub = bus.on(() => count++);
  unsub();
  bus.emit({ type: "USER_DELETED", userId: "U1" });
  results.push(
    count === 0
      ? "✅ T3: Unsubscribe works"
      : "❌ T3: Unsubscribe works"
  );

  // T4: getHistory() returns all events
  const history = bus.getHistory();
  results.push(
    history.length >= 3
      ? "✅ T4: getHistory returns all"
      : `❌ T4: getHistory returns all — got ${history.length}`
  );

  // T5: getHistory(type) filters correctly
  const userEvents = bus.getHistory("USER_CREATED");
  results.push(
    userEvents.length === 2 && userEvents.every((e) => e.type === "USER_CREATED")
      ? "✅ T5: getHistory filtered by type"
      : `❌ T5: getHistory filtered by type — got ${userEvents.length}`
  );

  // T6: Multiple handlers all fire
  let h1 = 0, h2 = 0;
  bus.on(() => h1++);
  bus.on(() => h2++);
  bus.emit({ type: "ORDER_CANCELLED", orderId: "O1", reason: "test" });
  results.push(
    h1 === 1 && h2 === 1
      ? "✅ T6: Multiple handlers fire"
      : "❌ T6: Multiple handlers fire"
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
