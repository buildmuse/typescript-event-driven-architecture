/**
 * ═══════════════════════════════════════════════
 * EXERCISE 15: Choreography Saga (No Coordinator)
 * ═══════════════════════════════════════════════
 * 
 * Services react to events independently — no central orchestrator.
 * Each service listens for events and emits new ones.
 * On failure, services emit compensation events.
 * 
 * Flow: OrderPlaced → InventoryReserved → PaymentCharged → ShipmentCreated
 * Failure at payment: PaymentFailed → InventoryReleased
 */

import { EventEmitter } from "events";

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

// You're given the event bus. Wire up the services.
const bus = new EventEmitter();
const eventLog: string[] = [];
bus.on("*", () => {}); // placeholder

/** Listens: OrderPlaced → Emits: InventoryReserved OR InventoryFailed */
function setupInventoryService(bus: EventEmitter): void {
  // TODO: listen for "OrderPlaced"
  // If payload.item === "OUT_OF_STOCK" → emit "InventoryFailed"
  // Otherwise → emit "InventoryReserved" with {orderId, reservationId}
  // Also listen for "PaymentFailed" → emit "InventoryReleased" (compensation)
  throw new Error("Not implemented");
}

/** Listens: InventoryReserved → Emits: PaymentCharged OR PaymentFailed */
function setupPaymentService(bus: EventEmitter): void {
  // TODO: listen for "InventoryReserved"
  // If payload.amount > 10000 → emit "PaymentFailed" with {reason}
  // Otherwise → emit "PaymentCharged" with {orderId, transactionId}
  throw new Error("Not implemented");
}

/** Listens: PaymentCharged → Emits: ShipmentCreated */
function setupShippingService(bus: EventEmitter): void {
  // TODO: emit "ShipmentCreated" with {orderId, trackingId}
  throw new Error("Not implemented");
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  // Track all events
  const events: Array<{ type: string; payload: any }> = [];
  const allEventTypes = ["OrderPlaced", "InventoryReserved", "InventoryFailed",
    "PaymentCharged", "PaymentFailed", "ShipmentCreated", "InventoryReleased"];
  for (const type of allEventTypes) {
    bus.on(type, (payload: any) => events.push({ type, payload }));
  }

  setupInventoryService(bus);
  setupPaymentService(bus);
  setupShippingService(bus);

  // T1: Happy path
  bus.emit("OrderPlaced", { orderId: "O-1", item: "Laptop", amount: 999 });
  const t1Events = events.map((e) => e.type);
  results.push(
    t1Events.includes("InventoryReserved") && t1Events.includes("PaymentCharged") && t1Events.includes("ShipmentCreated")
      ? "✅ T1: Happy path complete"
      : `❌ T1: got [${t1Events}]`
  );

  // T2: Payment failure → compensation
  events.length = 0;
  bus.emit("OrderPlaced", { orderId: "O-2", item: "Gold", amount: 50000 });
  const t2Events = events.map((e) => e.type);
  results.push(t2Events.includes("PaymentFailed") ? "✅ T2: Payment failed" : "❌ T2: PaymentFailed missing");
  results.push(t2Events.includes("InventoryReleased") ? "✅ T3: Inventory compensated" : "❌ T3: InventoryReleased missing");
  results.push(!t2Events.includes("ShipmentCreated") ? "✅ T4: No shipment on failure" : "❌ T4: Should not ship");

  // T5: Inventory failure → no payment attempted
  events.length = 0;
  bus.emit("OrderPlaced", { orderId: "O-3", item: "OUT_OF_STOCK", amount: 100 });
  const t5Events = events.map((e) => e.type);
  results.push(t5Events.includes("InventoryFailed") ? "✅ T5: Inventory failed" : "❌ T5: InventoryFailed missing");
  results.push(!t5Events.includes("PaymentCharged") ? "✅ T6: No payment on inv failure" : "❌ T6: Should not charge");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
