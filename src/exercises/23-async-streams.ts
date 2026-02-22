/**
 * EXERCISE 23: Async Iterable Event Stream with Operators
 * Build a stream consumable with for-await-of. Add map(), filter(), take().
 */
class EventStream<T> implements AsyncIterable<T> {
  push(value: T): void { throw new Error("Not implemented"); }
  end(): void { throw new Error("Not implemented"); }
  [Symbol.asyncIterator](): AsyncIterator<T> { throw new Error("Not implemented"); }
  map<R>(transform: (value: T) => R): EventStream<R> { throw new Error("Not implemented"); }
  filter(predicate: (value: T) => boolean): EventStream<T> { throw new Error("Not implemented"); }
  take(count: number): EventStream<T> { throw new Error("Not implemented"); }
}

async function verify() {
  const r: string[] = [];
  const s1 = new EventStream<number>();
  setTimeout(() => { s1.push(1); s1.push(2); s1.push(3); s1.end(); }, 0);
  const items: number[] = [];
  for await (const v of s1) items.push(v);
  r.push(items.join(",") === "1,2,3" ? "✅ T1: Basic" : `❌ T1: [${items}]`);

  const s2 = new EventStream<number>();
  setTimeout(() => { s2.push(1); s2.push(2); s2.push(3); s2.end(); }, 0);
  const mapped: number[] = [];
  for await (const v of s2.map(n => n * 10)) mapped.push(v);
  r.push(mapped.join(",") === "10,20,30" ? "✅ T2: Map" : `❌ T2: [${mapped}]`);

  const s3 = new EventStream<number>();
  setTimeout(() => { for (let i = 1; i <= 6; i++) s3.push(i); s3.end(); }, 0);
  const even: number[] = [];
  for await (const v of s3.filter(n => n % 2 === 0)) even.push(v);
  r.push(even.join(",") === "2,4,6" ? "✅ T3: Filter" : `❌ T3: [${even}]`);

  const s4 = new EventStream<number>();
  setTimeout(() => { for (let i = 1; i <= 10; i++) s4.push(i); s4.end(); }, 0);
  const taken: number[] = [];
  for await (const v of s4.take(3)) taken.push(v);
  r.push(taken.join(",") === "1,2,3" ? "✅ T4: Take" : `❌ T4: [${taken}]`);

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
