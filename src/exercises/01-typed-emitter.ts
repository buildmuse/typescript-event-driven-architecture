/**
 * ═══════════════════════════════════════════════
 * EXERCISE 01: Build a Typed EventEmitter
 * ═══════════════════════════════════════════════
 * 
 * Build a type-safe event emitter from scratch (NO imports).
 * 
 * Requirements:
 * - on(event, listener)    → register a listener, return unsubscribe fn
 * - emit(event, payload)   → call all listeners for that event
 * - off(event, listener)   → remove specific listener
 * - listenerCount(event)   → return number of listeners
 * 
 * Type Safety:
 * - Event names and payload types must be enforced via generics
 * - emit("order:created", wrongPayload) should be a type error
 */

// ── These types are given ──
interface AppEvents {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "order:created": { orderId: string; amount: number; items: string[] };
  "order:cancelled": { orderId: string; reason: string };
}

interface OrderEvents {
  "user:login": { userId: number, userName: string};
  "user:logout": {userId: number, userName: string, time: Date};
  "order:created": { orderId: string; amount: number; items: string[] };
  "order:cancelled": { orderId: string; reason: string };
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class TypedOrderEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  on<K extends keyof TEvents>(
    event : K,
    listener : (payload: TEvents[K]) => void 
  ) : this {
    this.emitter.on(event as string, listener);
    return this;
  }

  emit<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ) : this {
    this.emitter.emit(event as string, payload);
    return this;
  }


}


class TypedEmitter<TEvents extends Record<string, any>> {
  // TODO: implement internal storage

  private emitter = new EventEmitter();

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): () => void {
    // TODO: register listener, return unsubscribe function
    throw new Error("Not implemented");
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): boolean {
    // TODO: call all listeners, return true if any existed
    throw new Error("Not implemented");
  }

  off<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): void {
    // TODO: remove specific listener
    throw new Error("Not implemented");
  }

  listenerCount<K extends keyof TEvents>(event: K): number {
    // TODO
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS — Do not modify below this line
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const emitter = new TypedEmitter<AppEvents>();

  // Test 1: Basic on + emit
  let received: any = null;
  emitter.on("user:login", (data) => { received = data; });
  emitter.emit("user:login", { userId: "U1", timestamp: 123 });
  results.push(received?.userId === "U1" ? "✅ T1: on + emit" : "❌ T1: on + emit");

  // Test 2: Multiple listeners
  let count = 0;
  emitter.on("order:created", () => { count++; });
  emitter.on("order:created", () => { count++; });
  emitter.emit("order:created", { orderId: "O1", amount: 99, items: ["a"] });
  results.push(count === 2 ? "✅ T2: Multiple listeners" : "❌ T2: Multiple listeners");

  // Test 3: off removes listener
  const handler = (data: AppEvents["user:logout"]) => { count += 10; };
  emitter.on("user:logout", handler);
  emitter.off("user:logout", handler);
  count = 0;
  emitter.emit("user:logout", { userId: "U1" });
  results.push(count === 0 ? "✅ T3: off removes listener" : "❌ T3: off removes listener");

  // Test 4: Unsubscribe function
  count = 0;
  const unsub = emitter.on("order:cancelled", () => { count++; });
  unsub();
  emitter.emit("order:cancelled", { orderId: "O1", reason: "test" });
  results.push(count === 0 ? "✅ T4: Unsubscribe fn works" : "❌ T4: Unsubscribe fn works");

  // Test 5: listenerCount
  const e2 = new TypedEmitter<AppEvents>();
  e2.on("user:login", () => {});
  e2.on("user:login", () => {});
  e2.on("user:logout", () => {});
  results.push(e2.listenerCount("user:login") === 2 ? "✅ T5: listenerCount" : "❌ T5: listenerCount");

  // Test 6: emit returns false if no listeners
  const e3 = new TypedEmitter<AppEvents>();
  const had = e3.emit("user:login", { userId: "U1", timestamp: 0 });
  results.push(had === false ? "✅ T6: emit returns false" : "❌ T6: emit returns false");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
