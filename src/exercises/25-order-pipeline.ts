/**
 * ═══════════════════════════════════════════════
 * EXERCISE 25: Order Processing Pipeline (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 45 minutes
 * 
 * Build a COMPLETE order processing system combining:
 * - Event Bus for communication
 * - Saga for multi-step processing with compensation
 * - Dead Letter Queue for failed orders
 * - Correlation ID for tracing
 * - Event log for audit trail
 * 
 * Flow: OrderPlaced → ReserveInventory → ChargePayment → CreateShipment → OrderCompleted
 * On failure at any step: compensate all previous steps, move to DLQ
 */

import { EventEmitter } from "events";

interface OrderEvent {
  type: string;
  orderId: string;
  correlationId: string;
  payload: any;
  timestamp: number;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

const bus = new EventEmitter();
const eventLog: OrderEvent[] = [];
const dlq: OrderEvent[] = [];

class InventoryService {
  constructor(private stock: Map<string, number>) {}
  // TODO: Listen for "OrderPlaced" on bus
  // If stock available: decrement stock, emit "InventoryReserved"
  // If not: emit "InventoryFailed"
  // Listen for "CompensateInventory": restore stock
  setup(): void { throw new Error("Not implemented"); }
}

class PaymentService {
  // TODO: Listen for "InventoryReserved"
  // If amount > 10000: emit "PaymentFailed" with {retryable: false}
  // Otherwise: emit "PaymentCharged"
  // Listen for "CompensatePayment": emit refund log
  setup(): void { throw new Error("Not implemented"); }
}

class ShippingService {
  // TODO: Listen for "PaymentCharged" → emit "ShipmentCreated"
  setup(): void { throw new Error("Not implemented"); }
}

class OrderSaga {
  // TODO: 
  // Listen for "ShipmentCreated" → emit "OrderCompleted"
  // Listen for "InventoryFailed" → emit "OrderFailed", add to DLQ
  // Listen for "PaymentFailed" → emit "CompensateInventory", then "OrderFailed", add to DLQ
  setup(): void { throw new Error("Not implemented"); }

  placeOrder(orderId: string, item: string, quantity: number, amount: number): void {
    // TODO: create OrderPlaced event with correlationId, emit on bus, log it
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  const stock = new Map([["LAPTOP", 10], ["MOUSE", 50]]);
  const inv = new InventoryService(stock);
  const pay = new PaymentService();
  const ship = new ShippingService();
  const saga = new OrderSaga();

  inv.setup();
  pay.setup();
  ship.setup();
  saga.setup();

  // T1: Happy path
  saga.placeOrder("ORD-1", "LAPTOP", 2, 999);
  const ord1Events = eventLog.filter(e => e.orderId === "ORD-1").map(e => e.type);
  results.push(
    ord1Events.includes("OrderCompleted")
      ? "✅ T1: Happy path completes"
      : `❌ T1: events=[${ord1Events}]`
  );

  // T2: Correlation ID consistent
  const ord1Corrs = eventLog.filter(e => e.orderId === "ORD-1").map(e => e.correlationId);
  const allSame = ord1Corrs.every(c => c === ord1Corrs[0]);
  results.push(allSame ? "✅ T2: Correlation ID consistent" : "❌ T2: Different correlation IDs");

  // T3: Inventory decremented
  results.push(stock.get("LAPTOP") === 8 ? "✅ T3: Stock decremented" : `❌ T3: stock=${stock.get("LAPTOP")}`);

  // T4: Inventory failure
  saga.placeOrder("ORD-2", "LAPTOP", 999, 100);
  const ord2Events = eventLog.filter(e => e.orderId === "ORD-2").map(e => e.type);
  results.push(ord2Events.includes("InventoryFailed") ? "✅ T4: Inventory fails" : "❌ T4");
  results.push(ord2Events.includes("OrderFailed") ? "✅ T5: Order fails" : "❌ T5");

  // T6: Payment failure triggers compensation
  saga.placeOrder("ORD-3", "MOUSE", 1, 50000);
  const ord3Events = eventLog.filter(e => e.orderId === "ORD-3").map(e => e.type);
  results.push(ord3Events.includes("PaymentFailed") ? "✅ T6: Payment fails" : "❌ T6");
  results.push(ord3Events.includes("CompensateInventory") ? "✅ T7: Inventory compensated" : "❌ T7");

  // T8: Stock restored after compensation
  results.push(stock.get("MOUSE") === 50 ? "✅ T8: Stock restored" : `❌ T8: mouse=${stock.get("MOUSE")}`);

  // T9: DLQ has failed orders
  results.push(dlq.length >= 2 ? "✅ T9: DLQ has failures" : `❌ T9: dlq=${dlq.length}`);

  // T10: Event log has all events
  results.push(eventLog.length >= 8 ? "✅ T10: Event log populated" : `❌ T10: log=${eventLog.length}`);

  console.log("\n" + results.join("\n"));
  console.log(results.every(r => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
