/**
 * ═══════════════════════════════════════════════
 * EXERCISE 14: Saga Orchestrator with Compensation
 * ═══════════════════════════════════════════════
 * 
 * Execute steps in order. If any step fails, compensate all
 * previously completed steps in REVERSE order.
 */

type StepFn = (ctx: Record<string, any>) => Promise<Record<string, any>>;
type CompensateFn = (ctx: Record<string, any>) => Promise<void>;

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class SagaOrchestrator {
  addStep(name: string, execute: StepFn, compensate: CompensateFn): this {
    // TODO: store step
    throw new Error("Not implemented");
  }

  async run(initialContext: Record<string, any>): Promise<{
    success: boolean;
    context: Record<string, any>;
    completedSteps: string[];
    compensatedSteps: string[];
  }> {
    // TODO:
    // 1. Execute steps in order, merging returned data into context
    // 2. If step throws, compensate completed steps in REVERSE order
    // 3. Return result with completed/compensated step names
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];
  const log: string[] = [];

  // T1: Happy path
  const s1 = new SagaOrchestrator();
  s1.addStep("A", async (ctx) => { log.push("A"); return { a: true }; }, async () => { log.push("comp-A"); });
  s1.addStep("B", async (ctx) => { log.push("B"); return { b: true }; }, async () => { log.push("comp-B"); });
  s1.addStep("C", async (ctx) => { log.push("C"); return { c: true }; }, async () => { log.push("comp-C"); });
  const r1 = await s1.run({});
  results.push(r1.success && r1.completedSteps.join(",") === "A,B,C" ? "✅ T1: Happy path" : "❌ T1: Happy path");
  results.push(r1.context.a && r1.context.b && r1.context.c ? "✅ T2: Context merged" : "❌ T2: Context merged");

  // T3: Failure at step B → compensate A in reverse
  log.length = 0;
  const s2 = new SagaOrchestrator();
  s2.addStep("A", async () => { log.push("exec-A"); return {}; }, async () => { log.push("comp-A"); });
  s2.addStep("B", async () => { throw new Error("boom"); }, async () => { log.push("comp-B"); });
  s2.addStep("C", async () => { log.push("exec-C"); return {}; }, async () => { log.push("comp-C"); });
  const r2 = await s2.run({});
  results.push(!r2.success ? "✅ T3: Failure detected" : "❌ T3: Should fail");
  results.push(
    r2.compensatedSteps.join(",") === "A"
      ? "✅ T4: Only A compensated"
      : `❌ T4: compensated=[${r2.compensatedSteps}]`
  );
  results.push(!log.includes("exec-C") ? "✅ T5: C never executed" : "❌ T5: C should not run");

  // T6: Failure at step C → compensate B,A (reverse order)
  log.length = 0;
  const s3 = new SagaOrchestrator();
  s3.addStep("A", async () => ({ a: 1 }), async () => { log.push("comp-A"); });
  s3.addStep("B", async () => ({ b: 2 }), async () => { log.push("comp-B"); });
  s3.addStep("C", async () => { throw new Error("fail"); }, async () => { log.push("comp-C"); });
  const r3 = await s3.run({});
  results.push(
    r3.compensatedSteps.join(",") === "B,A"
      ? "✅ T6: Reverse compensation order"
      : `❌ T6: compensated=[${r3.compensatedSteps}]`
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
