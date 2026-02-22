/**
 * EXERCISE 24: Durable Subscriptions (Replay Missed Messages)
 * Like Kafka consumer groups — new subscribers catch up on missed messages.
 * Each subscriber has an ID and tracks its offset.
 */

class DurableBroker<T> {
  publish(topic: string, message: T): void {
    // TODO: store message with auto-incrementing offset
    throw new Error("Not implemented");
  }

  subscribe(topic: string, subscriberId: string, handler: (msg: T, offset: number) => void): void {
    // TODO: 
    // - New subscriber: replay ALL existing messages, then receive live
    // - Returning subscriber: replay only messages AFTER their last offset
    // - Track offset per subscriber
    throw new Error("Not implemented");
  }

  getOffset(topic: string, subscriberId: string): number {
    // TODO: return last processed offset for subscriber (-1 if never subscribed)
    throw new Error("Not implemented");
  }
}

function verify() {
  const r: string[] = [];
  const broker = new DurableBroker<string>();

  broker.publish("events", "msg-1");
  broker.publish("events", "msg-2");
  broker.publish("events", "msg-3");

  // T1: New subscriber gets all missed messages
  const sub1Msgs: string[] = [];
  broker.subscribe("events", "sub-1", (msg) => sub1Msgs.push(msg));
  r.push(sub1Msgs.join(",") === "msg-1,msg-2,msg-3" ? "✅ T1: Replayed missed" : `❌ T1: [${sub1Msgs}]`);

  // T2: Live messages delivered
  broker.publish("events", "msg-4");
  r.push(sub1Msgs.includes("msg-4") ? "✅ T2: Live delivery" : "❌ T2");

  // T3: Second subscriber also gets full history
  const sub2Msgs: string[] = [];
  broker.subscribe("events", "sub-2", (msg) => sub2Msgs.push(msg));
  r.push(sub2Msgs.length === 4 ? "✅ T3: Sub2 got all 4" : `❌ T3: got ${sub2Msgs.length}`);

  // T4: Offset tracking
  r.push(broker.getOffset("events", "sub-1") === 4 ? "✅ T4: Offset=4" : `❌ T4: offset=${broker.getOffset("events","sub-1")}`);

  // T5: Reconnecting subscriber only gets new messages
  broker.publish("events", "msg-5");
  const sub1Reconnect: string[] = [];
  broker.subscribe("events", "sub-1", (msg) => sub1Reconnect.push(msg));
  r.push(sub1Reconnect.join(",") === "msg-5" ? "✅ T5: Reconnect only new" : `❌ T5: [${sub1Reconnect}]`);

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
