/**
 * ═══════════════════════════════════════════════
 * EXERCISE 17: Event Replay & Time Travel
 * ═══════════════════════════════════════════════
 * 
 * Given stored events, rebuild state at ANY point in time.
 */

interface StoredEvent { id: number; type: string; data: any; timestamp: number; }

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class ReplayableStore {
  private events: StoredEvent[] = [];
  private seq = 0;

  append(type: string, data: any, timestamp?: number): void {
    // TODO: store event with auto-incrementing id
    throw new Error("Not implemented");
  }

  /** Replay all events through a reducer, return final state */
  replay<S>(initialState: S, reducer: (state: S, event: StoredEvent) => S): S {
    // TODO
    throw new Error("Not implemented");
  }

  /** Replay events only up to a given timestamp */
  replayUntil<S>(timestamp: number, initialState: S, reducer: (state: S, event: StoredEvent) => S): S {
    // TODO
    throw new Error("Not implemented");
  }

  /** Replay from a specific event ID (exclusive) */
  replayFrom<S>(afterId: number, initialState: S, reducer: (state: S, event: StoredEvent) => S): S {
    // TODO
    throw new Error("Not implemented");
  }

  get count(): number { throw new Error("Not implemented"); }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const store = new ReplayableStore();

  // Counter events
  store.append("INCREMENT", { amount: 10 }, 1000);
  store.append("INCREMENT", { amount: 5 }, 2000);
  store.append("DECREMENT", { amount: 3 }, 3000);
  store.append("INCREMENT", { amount: 20 }, 4000);
  store.append("DECREMENT", { amount: 7 }, 5000);

  const reducer = (state: number, event: StoredEvent): number => {
    if (event.type === "INCREMENT") return state + event.data.amount;
    if (event.type === "DECREMENT") return state - event.data.amount;
    return state;
  };

  // T1: Full replay
  results.push(store.replay(0, reducer) === 25 ? "✅ T1: Full replay=25" : "❌ T1: Full replay");

  // T2: Replay until timestamp 2000 (first 2 events)
  results.push(store.replayUntil(2000, 0, reducer) === 15 ? "✅ T2: Until t=2000 → 15" : "❌ T2: Time travel");

  // T3: Replay until timestamp 3000
  results.push(store.replayUntil(3000, 0, reducer) === 12 ? "✅ T3: Until t=3000 → 12" : "❌ T3: Time travel");

  // T4: Replay from event #3
  results.push(store.replayFrom(3, 0, reducer) === 13 ? "✅ T4: From #3 → 13" : "❌ T4: Partial replay");

  // T5: Count
  results.push(store.count === 5 ? "✅ T5: Count=5" : "❌ T5: Count");

  console.log("\n" + results.join("\n"));
  console.log(results.every(r => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
