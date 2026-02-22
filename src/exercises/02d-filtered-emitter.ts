/**
 * ═══════════════════════════════════════════════
 * EXERCISE 02d: Filtered / Conditional Emitter
 * ═══════════════════════════════════════════════
 *
 * Extend a typed emitter with predicate-based filtering.
 * Listeners only fire when a condition is met.
 *
 * Requirements:
 * - on(event, listener)                    → always fires (inherited)
 * - onWhere(event, predicate, listener)    → fires only when predicate returns true
 * - onOnce(event, predicate, listener)     → fires only ONCE when predicate is true, then auto-removes
 * - emit(event, payload)                   → deliver to matching listeners
 * - listenerCount(event)                   → total listeners for event (including filtered ones)
 *
 * Type Safety:
 * - predicate receives the same typed payload as the listener
 * - emit("trade", wrongPayload) should be a type error
 */

// ── These types are given ──
interface TradeEvents {
  trade: { symbol: string; price: number; quantity: number };
  alert: { level: "low" | "medium" | "high"; message: string };
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class FilteredEmitter<TEvents extends Record<string, any>> {
  // TODO: internal storage for listeners

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void
  ): () => void {
    // TODO: register listener, return unsubscribe fn
    throw new Error("Not implemented");
  }

  onWhere<K extends keyof TEvents>(
    event: K,
    predicate: (payload: TEvents[K]) => boolean,
    listener: (payload: TEvents[K]) => void
  ): () => void {
    // TODO: listener only fires when predicate(payload) is true
    //       return unsubscribe fn
    throw new Error("Not implemented");
  }

  onOnce<K extends keyof TEvents>(
    event: K,
    predicate: (payload: TEvents[K]) => boolean,
    listener: (payload: TEvents[K]) => void
  ): () => void {
    // TODO: listener fires at most once (when predicate is true), then auto-removes
    //       return unsubscribe fn
    throw new Error("Not implemented");
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    // TODO: deliver payload to all registered listeners for this event
    throw new Error("Not implemented");
  }

  listenerCount<K extends keyof TEvents>(event: K): number {
    // TODO: return total number of listeners for this event
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS — Do not modify below this line
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  // T1: on() always fires
  const bus = new FilteredEmitter<TradeEvents>();
  const all: number[] = [];
  bus.on("trade", (t) => all.push(t.price));
  bus.emit("trade", { symbol: "AAPL", price: 100, quantity: 10 });
  bus.emit("trade", { symbol: "GOOG", price: 200, quantity: 5 });
  results.push(
    all.length === 2
      ? "✅ T1: on() fires for all"
      : "❌ T1: on() fires for all"
  );

  // T2: onWhere() fires only when predicate is true
  const highValue: string[] = [];
  bus.onWhere(
    "trade",
    (t) => t.price * t.quantity > 1000,
    (t) => highValue.push(t.symbol)
  );
  bus.emit("trade", { symbol: "AAPL", price: 150, quantity: 100 }); // 15000 → fires
  bus.emit("trade", { symbol: "GOOG", price: 50, quantity: 5 });    // 250   → no fire
  results.push(
    highValue.length === 1 && highValue[0] === "AAPL"
      ? "✅ T2: onWhere() filters correctly"
      : "❌ T2: onWhere() filters correctly"
  );

  // T3: onWhere() unsubscribe works
  const symbols: string[] = [];
  const unsub = bus.onWhere(
    "trade",
    () => true,
    (t) => symbols.push(t.symbol)
  );
  bus.emit("trade", { symbol: "TSLA", price: 300, quantity: 1 });
  unsub();
  bus.emit("trade", { symbol: "MSFT", price: 400, quantity: 1 });
  results.push(
    symbols.length === 1 && symbols[0] === "TSLA"
      ? "✅ T3: onWhere() unsubscribe"
      : "❌ T3: onWhere() unsubscribe"
  );

  // T4: onOnce() fires only once even if predicate matches multiple times
  const bus2 = new FilteredEmitter<TradeEvents>();
  let onceCount = 0;
  bus2.onOnce(
    "trade",
    (t) => t.symbol === "AAPL",
    () => onceCount++
  );
  bus2.emit("trade", { symbol: "AAPL", price: 100, quantity: 1 }); // fires
  bus2.emit("trade", { symbol: "AAPL", price: 110, quantity: 1 }); // should not fire
  bus2.emit("trade", { symbol: "AAPL", price: 120, quantity: 1 }); // should not fire
  results.push(
    onceCount === 1
      ? "✅ T4: onOnce() fires exactly once"
      : `❌ T4: onOnce() fires exactly once — fired ${onceCount} times`
  );

  // T5: onOnce() skips until predicate is true
  const bus3 = new FilteredEmitter<TradeEvents>();
  let onceSymbol = "";
  bus3.onOnce(
    "trade",
    (t) => t.price > 200,
    (t) => { onceSymbol = t.symbol; }
  );
  bus3.emit("trade", { symbol: "LOW", price: 50, quantity: 1 });  // predicate false
  bus3.emit("trade", { symbol: "HIGH", price: 300, quantity: 1 }); // predicate true → fires
  bus3.emit("trade", { symbol: "HIGH2", price: 400, quantity: 1 }); // already removed
  results.push(
    onceSymbol === "HIGH"
      ? "✅ T5: onOnce() waits for predicate"
      : `❌ T5: onOnce() waits for predicate — got "${onceSymbol}"`
  );

  // T6: listenerCount includes all listener types
  const bus4 = new FilteredEmitter<TradeEvents>();
  bus4.on("trade", () => {});
  bus4.onWhere("trade", () => true, () => {});
  bus4.onOnce("trade", () => true, () => {});
  results.push(
    bus4.listenerCount("trade") === 3
      ? "✅ T6: listenerCount includes all types"
      : `❌ T6: listenerCount — got ${bus4.listenerCount("trade")}`
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
