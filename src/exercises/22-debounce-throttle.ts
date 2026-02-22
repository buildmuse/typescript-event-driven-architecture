/**
 * EXERCISE 22: Debounce & Throttle from Scratch
 * debounce: wait until calls stop, then fire once (last value)
 * throttle: fire at most once per interval (first value)
 */
function debounce<T extends (...args: any[]) => any>(fn: T, delayMs: number): (...args: Parameters<T>) => void {
  throw new Error("Not implemented");
}
function throttle<T extends (...args: any[]) => any>(fn: T, intervalMs: number): (...args: Parameters<T>) => void {
  throw new Error("Not implemented");
}

async function verify() {
  const r: string[] = [];
  let debResult = "";
  const db = debounce((v: string) => { debResult = v; }, 50);
  db("a"); db("b"); db("c");
  await new Promise(res => setTimeout(res, 100));
  r.push(debResult === "c" ? "✅ T1: Debounce last" : `❌ T1: "${debResult}"`);
  let count = 0;
  const db2 = debounce(() => { count++; }, 50);
  db2(); await new Promise(r => setTimeout(r, 30));
  db2(); await new Promise(r => setTimeout(r, 30));
  db2(); await new Promise(r => setTimeout(r, 80));
  r.push(count === 1 ? "✅ T2: Debounce once" : `❌ T2: count=${count}`);
  const calls: number[] = [];
  const th = throttle((n: number) => { calls.push(n); }, 100);
  th(1); th(2); th(3);
  r.push(calls.length === 1 && calls[0] === 1 ? "✅ T3: Throttle first" : `❌ T3: [${calls}]`);
  await new Promise(res => setTimeout(res, 120));
  th(4);
  r.push(calls.includes(4) ? "✅ T4: After interval" : "❌ T4");
  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
