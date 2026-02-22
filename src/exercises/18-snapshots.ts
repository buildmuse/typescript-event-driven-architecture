/**
 * ═══════════════════════════════════════════════
 * EXERCISE 18: Snapshot Optimization
 * ═══════════════════════════════════════════════
 * 
 * Event sourcing gets slow with many events. Snapshots save state
 * periodically so you only replay events AFTER the snapshot.
 */

interface Event { id: number; type: string; data: any; }

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class SnapshotStore<S> {
  constructor(
    private snapshotInterval: number, // snapshot every N events
    private reducer: (state: S, event: Event) => S,
    private initialState: S
  ) {}

  append(event: Event): void {
    // TODO: store event. If total events is multiple of snapshotInterval, save snapshot
    throw new Error("Not implemented");
  }

  getState(): S {
    // TODO: load latest snapshot, replay only events AFTER it
    // Track how many events were replayed (for testing)
    throw new Error("Not implemented");
  }

  get eventsReplayed(): number {
    // TODO: return how many events were replayed in last getState() call
    throw new Error("Not implemented");
  }

  get totalEvents(): number {
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const reducer = (state: number, event: Event) => {
    if (event.type === "ADD") return state + event.data.value;
    return state;
  };

  const store = new SnapshotStore<number>(5, reducer, 0);

  // Add 12 events
  for (let i = 1; i <= 12; i++) {
    store.append({ id: i, type: "ADD", data: { value: i } });
  }

  // State should be 1+2+...+12 = 78
  const state = store.getState();
  results.push(state === 78 ? "✅ T1: Correct state=78" : `❌ T1: state=${state}`);
  results.push(store.totalEvents === 12 ? "✅ T2: 12 events" : "❌ T2: total events");

  // Snapshot at event 10, so only 2 events should be replayed (11, 12)
  results.push(
    store.eventsReplayed === 2
      ? "✅ T3: Only 2 events replayed"
      : `❌ T3: replayed=${store.eventsReplayed} (expected 2)`
  );

  // Add 3 more (13, 14, 15) → snapshot at 15
  for (let i = 13; i <= 15; i++) {
    store.append({ id: i, type: "ADD", data: { value: i } });
  }
  const state2 = store.getState();
  // 1+2+...+15 = 120
  results.push(state2 === 120 ? "✅ T4: State=120" : `❌ T4: state=${state2}`);
  // Snapshot at 15, no events to replay
  results.push(store.eventsReplayed === 0 ? "✅ T5: 0 replayed" : `❌ T5: replayed=${store.eventsReplayed}`);

  console.log("\n" + results.join("\n"));
  console.log(results.every(r => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
