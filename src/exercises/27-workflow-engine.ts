/**
 * ═══════════════════════════════════════════════
 * EXERCISE 27: Workflow State Machine (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 40 minutes
 * 
 * Build a state machine where transitions are triggered by events.
 * Support guards (conditions) on transitions.
 * Emit events on every state change.
 */

import { EventEmitter } from "events";

interface Transition {
  from: string;
  event: string;
  to: string;
  guard?: (ctx: any) => boolean;
}

class StateMachine extends EventEmitter {
  constructor(
    private transitions: Transition[],
    private initialState: string,
    private terminalStates: string[]
  ) { super(); }

  createInstance(id: string, context?: any): StateMachineInstance {
    // TODO: create and return new instance
    throw new Error("Not implemented");
  }
}

class StateMachineInstance {
  // TODO: track current state, history, context

  sendEvent(event: string, data?: any): boolean {
    // TODO: find matching transition (from current state, matching event, guard passes)
    // Transition to new state, merge data into context
    // Emit "transition" event on parent machine: {id, from, to, event}
    // Return true if transitioned, false if no matching transition
    throw new Error("Not implemented");
  }

  get currentState(): string { throw new Error("Not implemented"); }
  get isTerminal(): boolean { throw new Error("Not implemented"); }
  get history(): Array<{ from: string; to: string; event: string }> { throw new Error("Not implemented"); }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const r: string[] = [];

  const machine = new StateMachine(
    [
      { from: "DRAFT", event: "submit", to: "PENDING" },
      { from: "PENDING", event: "approve", to: "APPROVED", guard: (ctx) => ctx.amount <= 1000 },
      { from: "PENDING", event: "approve", to: "NEEDS_REVIEW", guard: (ctx) => ctx.amount > 1000 },
      { from: "PENDING", event: "reject", to: "REJECTED" },
      { from: "NEEDS_REVIEW", event: "approve", to: "APPROVED" },
      { from: "NEEDS_REVIEW", event: "reject", to: "REJECTED" },
    ],
    "DRAFT",
    ["APPROVED", "REJECTED"]
  );

  const transitions: string[] = [];
  machine.on("transition", (data: any) => transitions.push(`${data.from}→${data.to}`));

  // T1: Basic transitions
  const inst1 = machine.createInstance("WF-1", { amount: 500 });
  r.push(inst1.currentState === "DRAFT" ? "✅ T1: Initial state" : "❌ T1");
  inst1.sendEvent("submit");
  r.push(inst1.currentState === "PENDING" ? "✅ T2: Submit→PENDING" : "❌ T2");
  inst1.sendEvent("approve");
  r.push(inst1.currentState === "APPROVED" ? "✅ T3: Auto-approve ≤1000" : `❌ T3: ${inst1.currentState}`);
  r.push(inst1.isTerminal ? "✅ T4: Is terminal" : "❌ T4");

  // T5: Guard routes to NEEDS_REVIEW
  const inst2 = machine.createInstance("WF-2", { amount: 5000 });
  inst2.sendEvent("submit");
  inst2.sendEvent("approve");
  r.push(inst2.currentState === "NEEDS_REVIEW" ? "✅ T5: Guard→NEEDS_REVIEW" : `❌ T5: ${inst2.currentState}`);
  inst2.sendEvent("approve");
  r.push(inst2.currentState === "APPROVED" ? "✅ T6: Final approve" : "❌ T6");

  // T7: Invalid event returns false
  const inst3 = machine.createInstance("WF-3", {});
  r.push(inst3.sendEvent("approve") === false ? "✅ T7: Invalid event" : "❌ T7");

  // T8: History tracking
  r.push(inst2.history.length === 3 ? "✅ T8: History length" : `❌ T8: ${inst2.history.length}`);

  // T9: Events emitted
  r.push(transitions.length >= 5 ? "✅ T9: Events emitted" : `❌ T9: ${transitions.length}`);

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
