/**
 * ============================================================
 * CONCEPT 15: Circuit Breaker + Events
 * ============================================================
 * 
 * Prevent cascading failures. Emit events on state transitions.
 * States: CLOSED → OPEN → HALF_OPEN → CLOSED
 * 
 * Java Parallel: Resilience4j CircuitBreaker
 */

import { EventEmitter } from "events";

console.log("═══ Circuit Breaker ═══\n");

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker extends EventEmitter {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailure = 0;

  constructor(
    private failureThreshold: number = 3,
    private resetTimeout: number = 5000,
    private halfOpenMax: number = 2,
  ) {
    super();
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailure >= this.resetTimeout) {
        this.transition("HALF_OPEN");
      } else {
        throw new Error("Circuit is OPEN - request rejected");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.halfOpenMax) {
        this.transition("CLOSED");
      }
    }
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailure = Date.now();

    if (this.state === "HALF_OPEN" || this.failureCount >= this.failureThreshold) {
      this.transition("OPEN");
    }
  }

  private transition(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.failureCount = 0;
    this.successCount = 0;

    console.log(`  🔄 ${oldState} → ${newState}`);
    this.emit("stateChange", { from: oldState, to: newState, timestamp: Date.now() });
  }

  getState(): CircuitState { return this.state; }
}

(async () => {
  const breaker = new CircuitBreaker(3, 1000, 2);

  breaker.on("stateChange", ({ from, to }) => {
    console.log(`  📡 Event: Circuit ${from} → ${to}`);
  });

  // Simulate flaky service
  let callNum = 0;
  const flakyService = async (): Promise<string> => {
    callNum++;
    if (callNum <= 4) throw new Error(`Fail #${callNum}`);
    return "Success!";
  };

  // 3 failures → circuit opens
  for (let i = 1; i <= 5; i++) {
    try {
      const result = await breaker.call(flakyService);
      console.log(`  Call ${i}: ${result} [${breaker.getState()}]`);
    } catch (err: any) {
      console.log(`  Call ${i}: ${err.message} [${breaker.getState()}]`);
    }
  }

  // Wait for reset timeout
  console.log(`\n  Waiting for reset...`);
  await new Promise((r) => setTimeout(r, 1200));

  // Half-open: allow limited requests
  callNum = 10; // Reset so calls succeed
  for (let i = 6; i <= 8; i++) {
    try {
      const result = await breaker.call(async () => "Recovered!");
      console.log(`  Call ${i}: ${result} [${breaker.getState()}]`);
    } catch (err: any) {
      console.log(`  Call ${i}: ${err.message} [${breaker.getState()}]`);
    }
  }

  console.log("\n✅ Concept 15 Complete! Run: npm run concept:debounce-throttle");
})();
