/**
 * ═══════════════════════════════════════════════
 * EXERCISE 07: Event Bus with Middleware Pipeline
 * ═══════════════════════════════════════════════
 * 
 * Build an event bus where events flow through a chain of middleware
 * before reaching handlers. Each middleware can:
 * - Modify the event
 * - Stop the pipeline (don't call next)
 * - Measure timing
 * 
 * This is like Express.js middleware but for events.
 */

interface BusEvent {
  type: string;
  payload: any;
  metadata: Record<string, any>;
}

type Next = () => Promise<void>;
type Middleware = (event: BusEvent, next: Next) => Promise<void>;
type Handler = (event: BusEvent) => void | Promise<void>;

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class MiddlewareEventBus {
  use(middleware: Middleware): void {
    // TODO: add middleware to pipeline
    throw new Error("Not implemented");
  }

  on(eventType: string, handler: Handler): void {
    // TODO: register handler for event type
    throw new Error("Not implemented");
  }

  async emit(event: BusEvent): Promise<void> {
    // TODO: run event through middleware pipeline, then to handlers
    // Middleware runs in order of registration
    // If middleware doesn't call next(), pipeline stops
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];

  // T1: Middleware runs in order
  const b1 = new MiddlewareEventBus();
  const order: number[] = [];
  b1.use(async (e, next) => { order.push(1); await next(); });
  b1.use(async (e, next) => { order.push(2); await next(); });
  b1.use(async (e, next) => { order.push(3); await next(); });
  b1.on("test", () => { order.push(4); });
  await b1.emit({ type: "test", payload: {}, metadata: {} });
  results.push(order.join(",") === "1,2,3,4" ? "✅ T1: Middleware order" : `❌ T1: order=[${order}]`);

  // T2: Middleware can modify event
  const b2 = new MiddlewareEventBus();
  b2.use(async (e, next) => { e.metadata.enriched = true; await next(); });
  let enriched = false;
  b2.on("test", (e) => { enriched = e.metadata.enriched === true; });
  await b2.emit({ type: "test", payload: {}, metadata: {} });
  results.push(enriched ? "✅ T2: Middleware modifies event" : "❌ T2: Middleware modifies event");

  // T3: Middleware can stop pipeline
  const b3 = new MiddlewareEventBus();
  let reached = false;
  b3.use(async (e, next) => { /* don't call next */ });
  b3.on("test", () => { reached = true; });
  await b3.emit({ type: "test", payload: {}, metadata: {} });
  results.push(!reached ? "✅ T3: Middleware stops pipeline" : "❌ T3: Middleware should stop");

  // T4: Only matching handlers fire
  const b4 = new MiddlewareEventBus();
  let aFired = false, bFired = false;
  b4.on("eventA", () => { aFired = true; });
  b4.on("eventB", () => { bFired = true; });
  await b4.emit({ type: "eventA", payload: {}, metadata: {} });
  results.push(aFired && !bFired ? "✅ T4: Event type routing" : "❌ T4: Event type routing");

  // T5: Middleware wraps handlers (runs before AND after)
  const b5 = new MiddlewareEventBus();
  const timeline: string[] = [];
  b5.use(async (e, next) => { timeline.push("before"); await next(); timeline.push("after"); });
  b5.on("test", () => { timeline.push("handler"); });
  await b5.emit({ type: "test", payload: {}, metadata: {} });
  results.push(
    timeline.join(",") === "before,handler,after"
      ? "✅ T5: Middleware wraps"
      : `❌ T5: timeline=[${timeline}]`
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
