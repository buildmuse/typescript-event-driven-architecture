/**
 * ═══════════════════════════════════════════════
 * EXERCISE 03: Build a Pub/Sub Broker
 * ═══════════════════════════════════════════════
 * 
 * Unlike EventEmitter, Pub/Sub fully decouples publishers from subscribers.
 * Publishers don't know about subscribers. Broker handles routing.
 * 
 * Requirements:
 * - subscribe(topic, handler) → returns unsubscribe function
 * - publish(topic, message) → async, delivers to all subscribers
 * - getSubscriberCount(topic)
 * - Messages delivered in subscription order
 * - If a subscriber throws, others should still receive the message
 */

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class PubSubBroker<T = any> {
  subscribe(topic: string, handler: (message: T) => void | Promise<void>): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  async publish(topic: string, message: T): Promise<{ delivered: number; errors: number }> {
    // TODO: deliver to all subscribers
    // If a subscriber throws, catch it, count as error, continue to next
    // Return count of successful deliveries and errors
    throw new Error("Not implemented");
  }

  getSubscriberCount(topic: string): number {
    // TODO
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Basic subscribe + publish
  const broker = new PubSubBroker<{ id: number }>();
  let received: any = null;
  broker.subscribe("orders", (msg) => { received = msg; });
  await broker.publish("orders", { id: 1 });
  results.push(received?.id === 1 ? "✅ T1: Basic pub/sub" : "❌ T1: Basic pub/sub");

  // T2: Multiple subscribers
  const b2 = new PubSubBroker<string>();
  const msgs: string[] = [];
  b2.subscribe("chat", (m) => msgs.push("A:" + m));
  b2.subscribe("chat", (m) => msgs.push("B:" + m));
  await b2.publish("chat", "hello");
  results.push(
    msgs.join(",") === "A:hello,B:hello"
      ? "✅ T2: Multiple subscribers"
      : `❌ T2: Multiple subscribers — got [${msgs}]`
  );

  // T3: Unsubscribe works
  const b3 = new PubSubBroker<number>();
  let sum = 0;
  const unsub = b3.subscribe("nums", (n) => { sum += n; });
  await b3.publish("nums", 10);
  unsub();
  await b3.publish("nums", 20);
  results.push(sum === 10 ? "✅ T3: Unsubscribe works" : `❌ T3: Unsubscribe — sum=${sum}`);

  // T4: Subscriber error doesn't break others
  const b4 = new PubSubBroker<string>();
  const received4: string[] = [];
  b4.subscribe("data", () => { throw new Error("boom"); });
  b4.subscribe("data", (m) => { received4.push(m); });
  const result = await b4.publish("data", "test");
  results.push(
    received4[0] === "test" && result.errors === 1 && result.delivered === 1
      ? "✅ T4: Error isolation"
      : "❌ T4: Error isolation"
  );

  // T5: subscriberCount
  const b5 = new PubSubBroker();
  b5.subscribe("a", () => {});
  b5.subscribe("a", () => {});
  const unsub5 = b5.subscribe("a", () => {});
  unsub5();
  results.push(b5.getSubscriberCount("a") === 2 ? "✅ T5: subscriberCount" : "❌ T5: subscriberCount");

  // T6: Publish to empty topic
  const b6 = new PubSubBroker();
  const r6 = await b6.publish("empty", {});
  results.push(r6.delivered === 0 && r6.errors === 0 ? "✅ T6: Empty topic" : "❌ T6: Empty topic");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
