/**
 * ═══════════════════════════════════════════════
 * EXERCISE 02b: Async Typed Emitter
 * ═══════════════════════════════════════════════
 *
 * Build an async-aware typed event emitter where listeners
 * can be async and the emitter waits for all of them.
 *
 * Requirements:
 * - on(event, listener)         → register async or sync listener
 * - emit(event, payload)        → await all listeners in PARALLEL
 * - emitSequential(event, payload) → await listeners ONE BY ONE in order
 * - listenerCount(event)        → return number of listeners
 *
 * Type Safety:
 * - Event names and payload types must be enforced via generics
 * - Listeners can return void or Promise<void>
 */

// ── These types are given ──
interface NotificationEvents {
  "user:signup": { userId: string; email: string };
  "user:login":  { userId: string; ip: string };
  "order:placed": { orderId: string; amount: number };
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class AsyncTypedEmitter<TEvents extends Record<string, any>> {
  // TODO: internal storage for listeners

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void | Promise<void>
  ): this {
    // TODO: store listener
    throw new Error("Not implemented");
  }

  async emit<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ): Promise<void> {
    // TODO: call all listeners in parallel, await all
    throw new Error("Not implemented");
  }

  async emitSequential<K extends keyof TEvents>(
    event: K,
    payload: TEvents[K]
  ): Promise<void> {
    // TODO: call listeners one by one, await each before next
    throw new Error("Not implemented");
  }

  listenerCount<K extends keyof TEvents>(event: K): number {
    // TODO: return number of listeners for the event
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS — Do not modify below this line
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Async listeners all run in parallel
  const emitter = new AsyncTypedEmitter<NotificationEvents>();
  const log: string[] = [];

  emitter.on("user:signup", async (data) => {
    await new Promise((r) => setTimeout(r, 50));
    log.push(`email:${data.email}`);
  });
  emitter.on("user:signup", async (data) => {
    await new Promise((r) => setTimeout(r, 10));
    log.push(`profile:${data.userId}`);
  });

  await emitter.emit("user:signup", { userId: "U1", email: "a@b.com" });
  results.push(
    log.includes("email:a@b.com") && log.includes("profile:U1")
      ? "✅ T1: Parallel emit runs all listeners"
      : "❌ T1: Parallel emit runs all listeners"
  );

  // T2: Parallel — faster listener finishes first
  results.push(
    log[0] === "profile:U1" && log[1] === "email:a@b.com"
      ? "✅ T2: Parallel order (faster first)"
      : "❌ T2: Parallel order (faster first)"
  );

  // T3: Sequential — listeners run in registration order
  const emitter2 = new AsyncTypedEmitter<NotificationEvents>();
  const seqLog: string[] = [];

  emitter2.on("user:signup", async (data) => {
    await new Promise((r) => setTimeout(r, 50));
    seqLog.push(`slow:${data.userId}`);
  });
  emitter2.on("user:signup", async (data) => {
    await new Promise((r) => setTimeout(r, 10));
    seqLog.push(`fast:${data.userId}`);
  });

  await emitter2.emitSequential("user:signup", { userId: "U2", email: "x@y.com" });
  results.push(
    seqLog[0] === "slow:U2" && seqLog[1] === "fast:U2"
      ? "✅ T3: Sequential preserves order"
      : "❌ T3: Sequential preserves order"
  );

  // T4: listenerCount
  const emitter3 = new AsyncTypedEmitter<NotificationEvents>();
  emitter3.on("user:login", async () => {});
  emitter3.on("user:login", async () => {});
  emitter3.on("order:placed", async () => {});
  results.push(
    emitter3.listenerCount("user:login") === 2
      ? "✅ T4: listenerCount"
      : "❌ T4: listenerCount"
  );

  // T5: No listeners — emit resolves without error
  const emitter4 = new AsyncTypedEmitter<NotificationEvents>();
  try {
    await emitter4.emit("user:login", { userId: "U1", ip: "127.0.0.1" });
    results.push("✅ T5: emit with no listeners resolves");
  } catch {
    results.push("❌ T5: emit with no listeners resolves");
  }

  // T6: Sync listeners also work
  const emitter5 = new AsyncTypedEmitter<NotificationEvents>();
  let syncRan = false;
  emitter5.on("order:placed", (data) => { syncRan = data.orderId === "O1"; });
  await emitter5.emit("order:placed", { orderId: "O1", amount: 99 });
  results.push(syncRan ? "✅ T6: Sync listeners work" : "❌ T6: Sync listeners work");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
