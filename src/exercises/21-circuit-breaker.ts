/**
 * EXERCISE 21: Circuit Breaker with State Events
 * CLOSED → (failures >= threshold) → OPEN → (timeout) → HALF_OPEN → (success) → CLOSED
 */
import { EventEmitter } from "events";
type CBState = "CLOSED" | "OPEN" | "HALF_OPEN";

class CircuitBreaker extends EventEmitter {
  constructor(private failureThreshold: number, private resetTimeoutMs: number) { super(); }
  async call<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: implement state machine. Emit "stateChange" on transitions: {from, to}
    throw new Error("Not implemented");
  }
  get state(): CBState { throw new Error("Not implemented"); }
}

async function verify() {
  const r: string[] = [];
  const cb = new CircuitBreaker(3, 200);
  const transitions: string[] = [];
  cb.on("stateChange", ({from, to}: any) => transitions.push(`${from}→${to}`));
  for (let i = 0; i < 3; i++) {
    try { await cb.call(async () => { throw new Error("fail"); }); } catch {}
  }
  r.push(cb.state === "OPEN" ? "✅ T1: Opens" : `❌ T1: ${cb.state}`);
  let rejected = false;
  try { await cb.call(async () => "ok"); } catch(e: any) { rejected = e.message.includes("OPEN"); }
  r.push(rejected ? "✅ T2: Rejects when open" : "❌ T2");
  await new Promise(res => setTimeout(res, 250));
  try { await cb.call(async () => "recovered"); } catch {}
  r.push(cb.state === "CLOSED" ? "✅ T3: Recovers" : `❌ T3: ${cb.state}`);
  r.push(transitions.length >= 2 ? "✅ T4: Events emitted" : "❌ T4");
  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
