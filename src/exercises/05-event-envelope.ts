/**
 * ═══════════════════════════════════════════════
 * EXERCISE 05: Event Envelope with Correlation ID
 * ═══════════════════════════════════════════════
 * 
 * Every event in production needs metadata for tracing/debugging.
 * Build an EventBus that auto-wraps payloads in envelopes.
 * 
 * Requirements:
 * - Auto-generate unique event ID
 * - Auto-add timestamp
 * - Support correlationId for tracing chains of events
 * - startTrace() creates a new correlation ID
 * - All events emitted during a trace share the same correlationId
 */

interface Envelope<T> {
  id: string;
  timestamp: number;
  source: string;
  correlationId: string;
  payload: T;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class TracedEventBus {
  private currentCorrelation: string | null = null;
  // TODO: internal storage for handlers and emitted events log

  startTrace(): string {
    // TODO: generate a new correlationId (any unique string),
    //       set it as current, return it
    throw new Error("Not implemented");
  }

  endTrace(): void {
    // TODO: clear current correlationId
    throw new Error("Not implemented");
  }

  on(event: string, handler: (envelope: Envelope<any>) => void): void {
    // TODO
    throw new Error("Not implemented");
  }

  emit(event: string, source: string, payload: any): Envelope<any> {
    // TODO: wrap in envelope with auto id, timestamp, correlationId
    //       deliver to handlers, return the envelope
    throw new Error("Not implemented");
  }

  getEventLog(): Envelope<any>[] {
    // TODO: return all emitted envelopes in order
    throw new Error("Not implemented");
  }

  getTraceEvents(correlationId: string): Envelope<any>[] {
    // TODO: return all events with matching correlationId
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const bus = new TracedEventBus();

  // T1: Envelope has all fields
  const env = bus.emit("test", "test-service", { foo: "bar" });
  results.push(
    env.id && env.timestamp && env.source === "test-service" && env.payload.foo === "bar"
      ? "✅ T1: Envelope fields"
      : "❌ T1: Envelope fields"
  );

  // T2: Auto-generated unique IDs
  const env2 = bus.emit("test", "svc", {});
  results.push(env.id !== env2.id ? "✅ T2: Unique IDs" : "❌ T2: Unique IDs");

  // T3: correlationId links events in a trace
  const traceId = bus.startTrace();
  bus.emit("step1", "svc-a", { step: 1 });
  bus.emit("step2", "svc-b", { step: 2 });
  bus.emit("step3", "svc-c", { step: 3 });
  bus.endTrace();

  const traceEvents = bus.getTraceEvents(traceId);
  results.push(
    traceEvents.length === 3 && traceEvents.every((e) => e.correlationId === traceId)
      ? "✅ T3: Trace correlation"
      : `❌ T3: Trace correlation — got ${traceEvents.length} events`
  );

  // T4: Events outside trace have different/no correlationId
  bus.emit("outside", "svc", {});
  const outsideEvents = bus.getEventLog().filter((e) => e.payload.step === undefined && e.payload.foo === undefined);
  results.push(
    outsideEvents.length > 0 && outsideEvents[0].correlationId !== traceId
      ? "✅ T4: Outside trace different ID"
      : "❌ T4: Outside trace different ID"
  );

  // T5: Handler receives envelope
  let handlerReceived: Envelope<any> | null = null;
  bus.on("myevent", (env) => { handlerReceived = env; });
  bus.emit("myevent", "origin", { value: 42 });
  results.push(
    handlerReceived?.payload.value === 42 && handlerReceived?.source === "origin"
      ? "✅ T5: Handler gets envelope"
      : "❌ T5: Handler gets envelope"
  );

  // T6: getEventLog returns all
  results.push(bus.getEventLog().length >= 6 ? "✅ T6: Event log" : "❌ T6: Event log");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
