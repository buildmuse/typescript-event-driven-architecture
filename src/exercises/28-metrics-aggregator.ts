/**
 * ═══════════════════════════════════════════════
 * EXERCISE 28: Real-Time Metrics Aggregator (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 35 minutes
 * 
 * Ingest metric events, compute windowed aggregations.
 */

interface MetricEvent {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

class MetricsAggregator {
  private events: MetricEvent[] = [];

  ingest(event: MetricEvent): void {
    // TODO: store event
    throw new Error("Not implemented");
  }

  /** Count events matching name within time window */
  count(name: string, windowMs: number, now: number): number {
    // TODO
    throw new Error("Not implemented");
  }

  /** Average value for metric within time window */
  avg(name: string, windowMs: number, now: number): number {
    // TODO
    throw new Error("Not implemented");
  }

  /** Max value for metric within time window */
  max(name: string, windowMs: number, now: number): number {
    // TODO
    throw new Error("Not implemented");
  }

  /** Percentile (p50, p95, p99) for metric within time window */
  percentile(name: string, p: number, windowMs: number, now: number): number {
    // TODO: p is 0-100. p50 = median. Sort values, pick index.
    throw new Error("Not implemented");
  }

  /** Group by tag and sum values */
  groupBySum(name: string, tagKey: string, windowMs: number, now: number): Map<string, number> {
    // TODO
    throw new Error("Not implemented");
  }
}

function verify() {
  const r: string[] = [];
  const agg = new MetricsAggregator();
  const now = 10000;

  // Ingest latency events
  const latencies = [10, 20, 30, 50, 100, 200, 500, 15, 25, 35];
  latencies.forEach((v, i) => {
    agg.ingest({ name: "api.latency", value: v, tags: { endpoint: i < 5 ? "/users" : "/orders" }, timestamp: now - (latencies.length - i) * 100 });
  });

  // Old event (outside window)
  agg.ingest({ name: "api.latency", value: 9999, tags: { endpoint: "/old" }, timestamp: 1 });

  r.push(agg.count("api.latency", 2000, now) === 10 ? "✅ T1: Count=10" : `❌ T1: ${agg.count("api.latency", 2000, now)}`);
  r.push(Math.abs(agg.avg("api.latency", 2000, now) - 98.5) < 0.1 ? "✅ T2: Avg" : `❌ T2: ${agg.avg("api.latency", 2000, now)}`);
  r.push(agg.max("api.latency", 2000, now) === 500 ? "✅ T3: Max=500" : "❌ T3");

  // p50 of sorted [10,15,20,25,30,35,50,100,200,500] = 30 (index 4)
  const p50 = agg.percentile("api.latency", 50, 2000, now);
  r.push(p50 === 30 || p50 === 35 ? "✅ T4: p50 ~30" : `❌ T4: p50=${p50}`);

  const groups = agg.groupBySum("api.latency", "endpoint", 2000, now);
  r.push(groups.get("/users") === 210 ? "✅ T5: /users sum=210" : `❌ T5: ${groups.get("/users")}`);

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
