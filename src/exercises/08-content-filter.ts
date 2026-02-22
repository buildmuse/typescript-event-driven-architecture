/**
 * ═══════════════════════════════════════════════
 * EXERCISE 08: Content-Based Message Filtering
 * ═══════════════════════════════════════════════
 * 
 * Subscribe with a PREDICATE instead of just a topic.
 * Only messages matching the predicate are delivered.
 */

interface Message {
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  source: string;
  payload: any;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class FilteredBroker {
  subscribe(
    filter: (msg: Message) => boolean,
    handler: (msg: Message) => void
  ): () => void {
    // TODO: store filter+handler pair, return unsubscribe fn
    throw new Error("Not implemented");
  }

  publish(message: Message): number {
    // TODO: deliver to all subscribers whose filter returns true
    // Return count of deliveries
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const broker = new FilteredBroker();
  const critical: Message[] = [];
  const orders: Message[] = [];
  const all: Message[] = [];

  broker.subscribe((m) => m.priority === "critical", (m) => critical.push(m));
  broker.subscribe((m) => m.type.startsWith("order"), (m) => orders.push(m));
  broker.subscribe(() => true, (m) => all.push(m));

  broker.publish({ type: "order:created", priority: "high", source: "api", payload: { id: 1 } });
  broker.publish({ type: "user:login", priority: "low", source: "auth", payload: { id: 2 } });
  broker.publish({ type: "order:failed", priority: "critical", source: "api", payload: { id: 3 } });
  broker.publish({ type: "system:alert", priority: "critical", source: "monitor", payload: { id: 4 } });

  results.push(critical.length === 2 ? "✅ T1: Critical filter" : `❌ T1: critical=${critical.length}`);
  results.push(orders.length === 2 ? "✅ T2: Order filter" : `❌ T2: orders=${orders.length}`);
  results.push(all.length === 4 ? "✅ T3: Catch-all" : `❌ T3: all=${all.length}`);

  // T4: Count returned
  const count = broker.publish({ type: "order:shipped", priority: "low", source: "api", payload: {} });
  results.push(count === 2 ? "✅ T4: Delivery count" : `❌ T4: count=${count}`); // orders + all

  // T5: Unsubscribe
  const unsub = broker.subscribe(() => true, () => {});
  unsub();
  const count2 = broker.publish({ type: "test", priority: "low", source: "x", payload: {} });
  results.push(count2 === 1 ? "✅ T5: Unsubscribe" : `❌ T5: count after unsub=${count2}`); // only 'all' left

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
