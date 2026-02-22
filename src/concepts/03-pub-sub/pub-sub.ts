/**
 * ============================================================
 * CONCEPT 03: Pub/Sub (Publish-Subscribe) Pattern
 * ============================================================
 * 
 * Key differences from EventEmitter:
 * - Publishers don't know about subscribers (fully decoupled)
 * - Topic-based routing
 * - Supports async delivery
 * - Can have message broker in between
 * 
 * Java Parallel: Like JMS Topics, Google Guava EventBus, or Kafka Consumer Groups
 */

// ─────────────────────────────────────────────
// 1. BASIC PUB/SUB BROKER
// ─────────────────────────────────────────────
console.log("═══ 1. Basic Pub/Sub Broker ═══\n");

type Subscriber<T = any> = (message: T) => void | Promise<void>;

class PubSubBroker {
  private topics = new Map<string, Set<Subscriber>>();

  subscribe<T>(topic: string, subscriber: Subscriber<T>): () => void {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, new Set());
    }
    this.topics.get(topic)!.add(subscriber);

    // Return unsubscribe function (like RxJS subscription)
    return () => {
      this.topics.get(topic)?.delete(subscriber);
    };
  }

  async publish<T>(topic: string, message: T): Promise<void> {
    const subs = this.topics.get(topic);
    if (!subs || subs.size === 0) return;

    await Promise.all(
      Array.from(subs).map((sub) => sub(message))
    );
  }

  getSubscriberCount(topic: string): number {
    return this.topics.get(topic)?.size ?? 0;
  }
}

const broker = new PubSubBroker();

// Subscribers don't know who publishes
const unsub1 = broker.subscribe("orders", (msg: any) => {
  console.log(`  [Inventory] Process: ${msg.orderId}`);
});

const unsub2 = broker.subscribe("orders", (msg: any) => {
  console.log(`  [Shipping] Queue: ${msg.orderId}`);
});

// Publisher doesn't know who subscribes
(async () => {
  await broker.publish("orders", { orderId: "ORD-001", item: "Laptop" });
  console.log(`  Subscribers on 'orders': ${broker.getSubscriberCount("orders")}`);

  unsub1(); // Unsubscribe inventory
  await broker.publish("orders", { orderId: "ORD-002", item: "Mouse" });
  console.log(`  After unsub, subscribers: ${broker.getSubscriberCount("orders")}\n`);

  // ─────────────────────────────────────────────
  // 2. TOPIC HIERARCHY (like MQTT or RabbitMQ)
  // ─────────────────────────────────────────────
  console.log("═══ 2. Topic Hierarchy with Wildcards ═══\n");

  class HierarchicalPubSub {
    private subscriptions = new Map<string, Set<Subscriber>>();

    subscribe(pattern: string, subscriber: Subscriber): () => void {
      if (!this.subscriptions.has(pattern)) {
        this.subscriptions.set(pattern, new Set());
      }
      this.subscriptions.get(pattern)!.add(subscriber);
      return () => this.subscriptions.get(pattern)?.delete(subscriber);
    }

    async publish(topic: string, message: any): Promise<void> {
      for (const [pattern, subs] of this.subscriptions) {
        if (this.matches(topic, pattern)) {
          for (const sub of subs) {
            await sub(message);
          }
        }
      }
    }

    private matches(topic: string, pattern: string): boolean {
      if (pattern === topic) return true;
      if (pattern === "#") return true; // Match everything

      const topicParts = topic.split("/");
      const patternParts = pattern.split("/");

      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i] === "#") return true; // Multi-level wildcard
        if (patternParts[i] === "+") continue; // Single-level wildcard
        if (patternParts[i] !== topicParts[i]) return false;
      }

      return topicParts.length === patternParts.length;
    }
  }

  const mqtt = new HierarchicalPubSub();

  // Subscribe to all sensor data
  mqtt.subscribe("sensors/#", (msg) => {
    console.log(`  [All Sensors] ${JSON.stringify(msg)}`);
  });

  // Subscribe to temperature sensors only
  mqtt.subscribe("sensors/+/temperature", (msg) => {
    console.log(`  [Temp Only] ${JSON.stringify(msg)}`);
  });

  // Subscribe to specific room
  mqtt.subscribe("sensors/room1/temperature", (msg) => {
    console.log(`  [Room1 Temp] ${JSON.stringify(msg)}`);
  });

  await mqtt.publish("sensors/room1/temperature", { value: 22.5 });
  console.log("---");
  await mqtt.publish("sensors/room2/humidity", { value: 65 });

  // ─────────────────────────────────────────────
  // 3. FAN-OUT & FAN-IN
  // ─────────────────────────────────────────────
  console.log("\n═══ 3. Fan-Out & Fan-In ═══\n");

  class FanOutFanIn<T, R> {
    private workers: ((msg: T) => Promise<R>)[] = [];
    private resultHandler?: (results: R[]) => void;

    addWorker(worker: (msg: T) => Promise<R>): void {
      this.workers.push(worker);
    }

    onResults(handler: (results: R[]) => void): void {
      this.resultHandler = handler;
    }

    // Fan-out: send to all workers, Fan-in: collect all results
    async dispatch(message: T): Promise<R[]> {
      // Fan-out
      const promises = this.workers.map((w) => w(message));

      // Fan-in
      const results = await Promise.all(promises);
      this.resultHandler?.(results);
      return results;
    }
  }

  interface PriceCheck {
    product: string;
  }

  interface PriceResult {
    vendor: string;
    price: number;
  }

  const priceAggregator = new FanOutFanIn<PriceCheck, PriceResult>();

  // Add price-checking workers (like Kafka consumer group)
  priceAggregator.addWorker(async (req) => {
    await new Promise((r) => setTimeout(r, 50));
    return { vendor: "Amazon", price: 99.99 };
  });

  priceAggregator.addWorker(async (req) => {
    await new Promise((r) => setTimeout(r, 30));
    return { vendor: "BestBuy", price: 89.99 };
  });

  priceAggregator.addWorker(async (req) => {
    await new Promise((r) => setTimeout(r, 70));
    return { vendor: "Walmart", price: 94.99 };
  });

  priceAggregator.onResults((results) => {
    const cheapest = results.reduce((min, r) => (r.price < min.price ? r : min));
    console.log(`  Best price: ${cheapest.vendor} @ $${cheapest.price}`);
  });

  await priceAggregator.dispatch({ product: "Mechanical Keyboard" });

  // ─────────────────────────────────────────────
  // 4. MESSAGE FILTERING
  // ─────────────────────────────────────────────
  console.log("\n═══ 4. Content-Based Filtering ═══\n");

  interface Message {
    type: string;
    priority: "low" | "medium" | "high";
    payload: any;
  }

  class FilteredPubSub {
    private subscriptions: Array<{
      filter: (msg: Message) => boolean;
      handler: (msg: Message) => void;
    }> = [];

    subscribe(
      filter: (msg: Message) => boolean,
      handler: (msg: Message) => void
    ): () => void {
      const sub = { filter, handler };
      this.subscriptions.push(sub);
      return () => {
        const idx = this.subscriptions.indexOf(sub);
        if (idx >= 0) this.subscriptions.splice(idx, 1);
      };
    }

    publish(message: Message): void {
      for (const sub of this.subscriptions) {
        if (sub.filter(message)) {
          sub.handler(message);
        }
      }
    }
  }

  const filtered = new FilteredPubSub();

  // Only high priority
  filtered.subscribe(
    (msg) => msg.priority === "high",
    (msg) => console.log(`  🔴 [HIGH] ${msg.type}: ${JSON.stringify(msg.payload)}`)
  );

  // Only order events
  filtered.subscribe(
    (msg) => msg.type.startsWith("order"),
    (msg) => console.log(`  📦 [ORDER] ${msg.type}: ${JSON.stringify(msg.payload)}`)
  );

  filtered.publish({ type: "order:created", priority: "high", payload: { id: 1 } });
  filtered.publish({ type: "user:login", priority: "low", payload: { id: 2 } });
  filtered.publish({ type: "order:shipped", priority: "low", payload: { id: 1 } });

  // ─────────────────────────────────────────────
  // 5. DURABLE SUBSCRIPTIONS
  // ─────────────────────────────────────────────
  console.log("\n═══ 5. Durable Subscriptions (Replay Missed) ═══\n");

  class DurablePubSub {
    private topics = new Map<string, any[]>();
    private subscribers = new Map<string, Map<string, { handler: Subscriber; offset: number }>>();

    publish(topic: string, message: any): void {
      if (!this.topics.has(topic)) {
        this.topics.set(topic, []);
      }
      this.topics.get(topic)!.push({
        ...message,
        _offset: this.topics.get(topic)!.length,
        _timestamp: Date.now(),
      });

      // Deliver to active subscribers
      const subs = this.subscribers.get(topic);
      if (subs) {
        for (const [, sub] of subs) {
          sub.handler(message);
          sub.offset++;
        }
      }
    }

    // Durable subscribe - catches up on missed messages
    subscribe(topic: string, subscriberId: string, handler: Subscriber): void {
      if (!this.subscribers.has(topic)) {
        this.subscribers.set(topic, new Map());
      }

      const existingSub = this.subscribers.get(topic)!.get(subscriberId);
      const startOffset = existingSub?.offset ?? 0;

      // Replay missed messages
      const messages = this.topics.get(topic) ?? [];
      for (let i = startOffset; i < messages.length; i++) {
        console.log(`  [Replay] offset=${i}`);
        handler(messages[i]);
      }

      this.subscribers.get(topic)!.set(subscriberId, {
        handler,
        offset: messages.length,
      });
    }
  }

  const durable = new DurablePubSub();

  // Publish some messages before any subscriber
  durable.publish("events", { action: "created", id: 1 });
  durable.publish("events", { action: "updated", id: 1 });
  durable.publish("events", { action: "deleted", id: 1 });

  // Late subscriber gets all missed messages!
  console.log("  Late subscriber joining...");
  durable.subscribe("events", "sub-1", (msg) => {
    console.log(`  Received: ${msg.action} #${msg.id}`);
  });

  console.log("\n✅ Concept 03 Complete! Run: npm run concept:event-bus");
})();
