/**
 * ═══════════════════════════════════════════════
 * EXERCISE 02: once() and removeAllListeners()
 * ═══════════════════════════════════════════════
 * 
 * Extend your emitter with:
 * - once(event, listener) → fires listener only on FIRST emit, then auto-removes
 * - removeAllListeners(event?) → remove all for event, or ALL if no event given
 * - prependListener(event, listener) → add listener to FRONT of queue
 * 
 * Hint: once() wraps the original listener in a new function
 */

class EventEmitter {
  private listeners = new Map<string, Array<(...args: any[]) => void>>();

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const handlers = this.listeners.get(event);
    if (!handlers || handlers.length === 0) return false;
    for (const handler of [...handlers]) { handler(...args); }
    return true;
  }

  // ══════════════════════════════════════════════
  // YOUR CODE HERE
  // ══════════════════════════════════════════════

  once(event: string, listener: (...args: any[]) => void): this {
    // TODO: listener fires only once, then auto-removes itself
    throw new Error("Not implemented");
  }

  removeAllListeners(event?: string): this {
    // TODO: if event given, remove all for that event
    //       if no event, remove everything
    throw new Error("Not implemented");
  }

  prependListener(event: string, listener: (...args: any[]) => void): this {
    // TODO: add listener to FRONT of the array (runs first)
    throw new Error("Not implemented");
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  // T1: once fires only once
  const e1 = new EventEmitter();
  let count = 0;
  e1.once("ping", () => { count++; });
  e1.emit("ping");
  e1.emit("ping");
  e1.emit("ping");
  results.push(count === 1 ? "✅ T1: once fires only once" : `❌ T1: once — got ${count}`);

  // T2: once auto-removes (listenerCount goes to 0)
  results.push(e1.listenerCount("ping") === 0 ? "✅ T2: once auto-removes" : "❌ T2: once auto-removes");

  // T3: once passes args correctly
  let received: any = null;
  const e2 = new EventEmitter();
  e2.once("data", (val: any) => { received = val; });
  e2.emit("data", { id: 42 });
  results.push(received?.id === 42 ? "✅ T3: once passes args" : "❌ T3: once passes args");

  // T4: removeAllListeners for specific event
  const e3 = new EventEmitter();
  e3.on("a", () => {});
  e3.on("a", () => {});
  e3.on("b", () => {});
  e3.removeAllListeners("a");
  results.push(e3.listenerCount("a") === 0 ? "✅ T4: removeAll(event)" : "❌ T4: removeAll(event)");
  results.push(e3.listenerCount("b") === 1 ? "✅ T5: other events intact" : "❌ T5: other events intact");

  // T6: removeAllListeners with no args clears everything
  const e4 = new EventEmitter();
  e4.on("x", () => {});
  e4.on("y", () => {});
  e4.removeAllListeners();
  results.push(
    e4.listenerCount("x") === 0 && e4.listenerCount("y") === 0
      ? "✅ T6: removeAll() clears all"
      : "❌ T6: removeAll() clears all"
  );

  // T7: prependListener runs first
  const e5 = new EventEmitter();
  const order: number[] = [];
  e5.on("req", () => order.push(2));
  e5.prependListener("req", () => order.push(1));
  e5.on("req", () => order.push(3));
  e5.emit("req");
  results.push(
    order.join(",") === "1,2,3"
      ? "✅ T7: prependListener runs first"
      : `❌ T7: prependListener — got [${order}]`
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
