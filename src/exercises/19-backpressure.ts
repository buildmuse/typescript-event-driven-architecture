/**
 * EXERCISE 19: Backpressure — Bounded Buffer
 * Implement buffer with 3 overflow strategies: "drop-oldest", "drop-newest", "reject"
 */
type OverflowStrategy = "drop-oldest" | "drop-newest" | "reject";

class BoundedBuffer<T> {
  constructor(private capacity: number, private strategy: OverflowStrategy) {}
  push(item: T): { accepted: boolean; dropped?: T } { throw new Error("Not implemented"); }
  pull(): T | undefined { throw new Error("Not implemented"); }
  get size(): number { throw new Error("Not implemented"); }
  toArray(): T[] { throw new Error("Not implemented"); }
}

function verify() {
  const r: string[] = [];
  const b1 = new BoundedBuffer<number>(3, "drop-oldest");
  b1.push(1); b1.push(2); b1.push(3);
  const x = b1.push(4);
  r.push(x.accepted && x.dropped === 1 ? "✅ T1: Drop oldest" : "❌ T1");
  r.push(b1.toArray().join(",") === "2,3,4" ? "✅ T2: Buffer correct" : `❌ T2: [${b1.toArray()}]`);
  const b2 = new BoundedBuffer<number>(3, "drop-newest");
  b2.push(1); b2.push(2); b2.push(3);
  const y = b2.push(4);
  r.push(!y.accepted && y.dropped === 4 ? "✅ T3: Drop newest" : "❌ T3");
  const b3 = new BoundedBuffer<number>(2, "reject");
  b3.push(1); b3.push(2);
  r.push(!b3.push(3).accepted ? "✅ T4: Reject" : "❌ T4");
  r.push(b3.pull() === 1 ? "✅ T5: Pull FIFO" : "❌ T5");
  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
