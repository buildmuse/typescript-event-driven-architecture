/**
 * ═══════════════════════════════════════════════
 * EXERCISE 16: CQRS — Separate Command & Query Models
 * ═══════════════════════════════════════════════
 * 
 * Commands mutate state and produce events.
 * Events update read models (projections).
 * Read models are optimized for queries.
 * 
 * Domain: Todo App
 * Commands: AddTodo, CompleteTodo, DeleteTodo
 * Read Models: TodoList (all todos), CompletionStats (counts)
 */

import { EventEmitter } from "events";

interface TodoEvent { type: string; todoId: string; payload: any; timestamp: number; }

const eventBus = new EventEmitter();
const eventStore: TodoEvent[] = [];

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

/** WRITE SIDE: validates + produces events */
class TodoCommandHandler {
  addTodo(todoId: string, title: string): void {
    // TODO: validate title not empty, emit "TodoAdded" event via eventBus
    // Store event in eventStore
    throw new Error("Not implemented");
  }
  completeTodo(todoId: string): void {
    // TODO: emit "TodoCompleted" event
    throw new Error("Not implemented");
  }
  deleteTodo(todoId: string): void {
    // TODO: emit "TodoDeleted" event
    throw new Error("Not implemented");
  }
}

/** READ SIDE 1: List of todos with their status */
class TodoListProjection {
  private todos = new Map<string, { id: string; title: string; completed: boolean }>();

  constructor() {
    // TODO: subscribe to events on eventBus, update internal state
  }

  getAll(): Array<{ id: string; title: string; completed: boolean }> {
    throw new Error("Not implemented");
  }
  getActive(): Array<{ id: string; title: string }> {
    throw new Error("Not implemented");
  }
}

/** READ SIDE 2: Stats */
class StatsProjection {
  private added = 0;
  private completed = 0;
  private deleted = 0;

  constructor() {
    // TODO: subscribe to events
  }

  getStats(): { total: number; completed: number; deleted: number; active: number } {
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const list = new TodoListProjection();
  const stats = new StatsProjection();
  const cmds = new TodoCommandHandler();

  cmds.addTodo("t1", "Study Event Sourcing");
  cmds.addTodo("t2", "Practice Saga Pattern");
  cmds.addTodo("t3", "Review CQRS");
  cmds.completeTodo("t1");
  cmds.deleteTodo("t3");

  results.push(list.getAll().length === 2 ? "✅ T1: 2 todos in list" : `❌ T1: ${list.getAll().length}`);
  results.push(list.getActive().length === 1 ? "✅ T2: 1 active" : `❌ T2: ${list.getActive().length}`);
  results.push(list.getActive()[0]?.title === "Practice Saga Pattern" ? "✅ T3: Correct active" : "❌ T3: Wrong active");

  const s = stats.getStats();
  results.push(s.total === 3 ? "✅ T4: Total=3" : `❌ T4: total=${s.total}`);
  results.push(s.completed === 1 ? "✅ T5: Completed=1" : `❌ T5: completed=${s.completed}`);
  results.push(s.deleted === 1 ? "✅ T6: Deleted=1" : `❌ T6: deleted=${s.deleted}`);
  results.push(s.active === 1 ? "✅ T7: Active=1" : `❌ T7: active=${s.active}`);
  results.push(eventStore.length === 5 ? "✅ T8: 5 events stored" : `❌ T8: ${eventStore.length} events`);

  console.log("\n" + results.join("\n"));
  console.log(results.every(r => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
