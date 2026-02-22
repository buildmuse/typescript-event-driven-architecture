/**
 * EXERCISE 20: Token Bucket Rate Limiter
 * Tokens refill at constant rate. Each request consumes a token.
 */
class TokenBucket {
  constructor(private capacity: number, private refillRate: number) {} // refillRate = tokens/sec
  tryConsume(tokens?: number): boolean { throw new Error("Not implemented"); }
  get available(): number { throw new Error("Not implemented"); }
}

async function verify() {
  const r: string[] = [];
  const b = new TokenBucket(3, 100);
  r.push(b.tryConsume() ? "✅ T1: Consume 1" : "❌ T1");
  r.push(b.tryConsume() ? "✅ T2: Consume 2" : "❌ T2");
  r.push(b.tryConsume() ? "✅ T3: Consume 3" : "❌ T3");
  r.push(!b.tryConsume() ? "✅ T4: Empty rejected" : "❌ T4");
  await new Promise(res => setTimeout(res, 100));
  r.push(b.available >= 1 ? "✅ T5: Refilled" : `❌ T5: avail=${b.available}`);
  r.push(b.tryConsume() ? "✅ T6: After refill" : "❌ T6");
  const b2 = new TokenBucket(10, 0);
  r.push(b2.tryConsume(5) ? "✅ T7: Multi-consume" : "❌ T7");
  r.push(!b2.tryConsume(6) ? "✅ T8: Not enough" : "❌ T8");
  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
