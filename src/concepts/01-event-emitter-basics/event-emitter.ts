/**
 * ============================================================
 * CONCEPT 01: Event Emitter Basics
 * ============================================================
 * 
 * THE FOUNDATION of all event-driven architecture in Node.js/TS.
 * 
 * Key Interview Points:
 * - EventEmitter is Node.js's core event mechanism (like Java's Observable)
 * - Events are synchronous by default in Node.js (unlike Java's ExecutorService)
 * - Supports multiple listeners per event
 * - 'error' event is special - crashes process if unhandled
 * 
 * Java Parallel: Think of this as Java's PropertyChangeListener on steroids
 */

import { EventEmitter } from "events";

// ─────────────────────────────────────────────
// 1. BASIC EMIT & LISTEN
// ─────────────────────────────────────────────
console.log("═══ 1. Basic Emit & Listen ═══\n");

const emitter = new EventEmitter();

// Register listener (like Java's addEventListener)
emitter.on("greet", (name: String) => {
  console.log(`Hello ${name}`);
});

// Emit event (like Java's firePropertyChange)
emitter.emit("greet", "buildmuse");

// ─────────────────────────────────────────────
// 2. MULTIPLE LISTENERS (Fan-Out)
// ─────────────────────────────────────────────
console.log("\n═══ 2. Multiple Listeners ═══\n");

const orderEmitter = new EventEmitter();

// Same event, multiple handlers - ALL get called in registration order
orderEmitter.on("order:placed", (orderId: string) => {
  console.log(`[Inventory] Reserve stock for order ${orderId}`);
});

orderEmitter.on("order:placed", (orderId: string) => {
  console.log(`[Email] Send confirmation for order ${orderId}`);
});

orderEmitter.on("order:placed", (orderId: string) => {
  console.log(`[Analytics] Track order ${orderId}`);
});

orderEmitter.emit("order:placed", "ORD-001");

// ─────────────────────────────────────────────
// 3. ONCE - Fire only once then auto-remove
// ─────────────────────────────────────────────
console.log("\n═══ 3. Once Listener ═══\n");

const server = new EventEmitter();

// .once() - listener is removed after first invocation
server.once("ready", () => {
  console.log("Server started! (this prints only once)");
});

server.emit("ready"); // prints
server.emit("ready"); // nothing - listener already removed

// ─────────────────────────────────────────────
// 4. ERROR HANDLING - Critical Interview Topic!
// ─────────────────────────────────────────────
console.log("\n═══ 4. Error Handling ═══\n");

const riskyEmitter = new EventEmitter();

// ALWAYS register error handler! Unhandled 'error' event crashes the process.
// This is like Java's UncaughtExceptionHandler
riskyEmitter.on("error", (err: Error) => {
  console.log(`[Error caught] ${err.message}`);
});

riskyEmitter.emit("error", new Error("Something went wrong!"));

// ─────────────────────────────────────────────
// 5. REMOVING LISTENERS
// ─────────────────────────────────────────────
console.log("\n═══ 5. Removing Listeners ═══\n");

const bus = new EventEmitter();

const handler = (msg: string) => console.log(`Received: ${msg}`);
bus.on("message", handler);

bus.emit("message", "First"); // prints
bus.off("message", handler); // .off() is alias for .removeListener()
bus.emit("message", "Second"); // nothing - handler removed

// ─────────────────────────────────────────────
// 6. LISTENER COUNT & MAX LISTENERS
// ─────────────────────────────────────────────
console.log("\n═══ 6. Listener Management ═══\n");

const managed = new EventEmitter();

// Default max: 10. Beyond that, Node.js warns about memory leak
managed.setMaxListeners(20); // Increase if needed

managed.on("data", () => {});
managed.on("data", () => {});
managed.on("data", () => {});

console.log(`Listener count for 'data': ${managed.listenerCount("data")}`);
console.log(`Event names: ${managed.eventNames()}`);

// ─────────────────────────────────────────────
// 7. PREPEND LISTENER - Control execution order
// ─────────────────────────────────────────────
console.log("\n═══ 7. Prepend Listener ═══\n");

const priority = new EventEmitter();

priority.on("request", () => console.log("  2. Normal handler"));
priority.prependListener("request", () => console.log("  1. Prepended handler (runs first!)"));
priority.on("request", () => console.log("  3. Another normal handler"));

priority.emit("request");

// ─────────────────────────────────────────────
// 8. ASYNC EVENTS - Common Interview Question!
// ─────────────────────────────────────────────
console.log("\n═══ 8. Sync vs Async ═══\n");

const asyncDemo = new EventEmitter();

// ⚠️ EventEmitter is SYNCHRONOUS by default!
asyncDemo.on("process", () => {
  console.log("  Listener 1 (sync)");
});

asyncDemo.on("process", () => {
  // If you need async, wrap in setImmediate or use async handler
  setImmediate(() => console.log("  Listener 2 (async via setImmediate)"));
});

asyncDemo.on("process", () => {
  console.log("  Listener 3 (sync)");
});

console.log("Before emit");
asyncDemo.emit("process");
console.log("After emit (notice: sync listeners ran before this!)");

// ─────────────────────────────────────────────
// 9. EVENT INHERITANCE - Build custom emitters
// ─────────────────────────────────────────────
console.log("\n═══ 9. Custom Event Emitter Class ═══\n");

class OrderService extends EventEmitter {
  private orders: Map<string, string> = new Map();

  placeOrder(orderId: string, item: string): void {
    this.orders.set(orderId, item);
    this.emit("order:created", { orderId, item, timestamp: Date.now() });
  }

  cancelOrder(orderId: string): void {
    if (this.orders.has(orderId)) {
      const item = this.orders.get(orderId);
      this.orders.delete(orderId);
      this.emit("order:cancelled", { orderId, item });
    } else {
      this.emit("error", new Error(`Order ${orderId} not found`));
    }
  }
}

const orderService = new OrderService();

orderService.on("order:created", (data) => {
  console.log(`  ✅ Order created: ${data.orderId} - ${data.item}`);
});

orderService.on("order:cancelled", (data) => {
  console.log(`  ❌ Order cancelled: ${data.orderId}`);
});

orderService.on("error", (err) => {
  console.log(`  ⚠️ Error: ${err.message}`);
});

orderService.placeOrder("ORD-100", "Laptop");
orderService.cancelOrder("ORD-100");
orderService.cancelOrder("ORD-999"); // triggers error

// ─────────────────────────────────────────────
// 10. WILDCARD PATTERNS - Interview-worthy
// ─────────────────────────────────────────────
console.log("\n═══ 10. Event Namespacing Pattern ═══\n");

// Node.js doesn't support wildcards natively, but you can build it:
class WildcardEmitter extends EventEmitter {
  emitWithWildcard(event: string, ...args: any[]): boolean {
    // Emit exact event
    this.emit(event, ...args);
    
    // Emit wildcard patterns
    const parts = event.split(":");
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join(":") + ":*";
      this.emit(wildcard, event, ...args);
    }
    
    // Emit global wildcard
    this.emit("*", event, ...args);
    return true;
  }
}

const wc = new WildcardEmitter();
wc.on("order:*", (event: string, data: any) => {
  console.log(`  [Wildcard order:*] caught ${event}`);
});
wc.on("*", (event: string) => {
  console.log(`  [Global *] caught ${event}`);
});

wc.emitWithWildcard("order:created", { id: 1 });
wc.emitWithWildcard("order:shipped", { id: 1 });

console.log("\n✅ Concept 01 Complete! Run: npm run concept:typed-emitter");
