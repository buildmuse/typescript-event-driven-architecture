/**
 * ═══════════════════════════════════════════════
 * EXERCISE 30: Event-Sourced Inventory + CQRS (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 50 minutes — THE BOSS LEVEL
 * 
 * Full event sourcing + CQRS for inventory management.
 * Commands produce events. Events update multiple read models.
 */

import { EventEmitter } from "events";

interface InventoryEvent {
  type: "StockReceived" | "StockShipped" | "StockAdjusted";
  sku: string;
  warehouse: string;
  quantity: number; // positive for receive/adjust-up, negative for adjust-down
  timestamp: number;
}

const eventBus = new EventEmitter();
const eventStore: InventoryEvent[] = [];

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

/** WRITE SIDE */
class InventoryCommandHandler {
  receiveStock(sku: string, warehouse: string, quantity: number): void {
    // TODO: validate qty > 0, create event, store, publish on eventBus
    throw new Error("Not implemented");
  }

  shipStock(sku: string, warehouse: string, quantity: number): void {
    // TODO: validate sufficient stock (query eventStore to compute current level)
    // Create event, store, publish
    throw new Error("Not implemented");
  }

  adjustStock(sku: string, warehouse: string, quantity: number): void {
    // TODO: quantity can be negative (damaged) or positive (found)
    throw new Error("Not implemented");
  }
}

/** READ SIDE 1: Current stock levels per SKU per warehouse */
class StockLevelView {
  constructor() {
    // TODO: subscribe to eventBus, update internal map
  }

  getLevel(sku: string, warehouse: string): number {
    throw new Error("Not implemented");
  }

  getLowStock(threshold: number): Array<{sku: string; warehouse: string; level: number}> {
    throw new Error("Not implemented");
  }
}

/** READ SIDE 2: Warehouse summary — total SKUs and total units per warehouse */
class WarehouseSummaryView {
  constructor() {
    // TODO: subscribe to eventBus
  }

  getSummary(warehouse: string): { skuCount: number; totalUnits: number } {
    throw new Error("Not implemented");
  }
}

/** TIME TRAVEL: Compute stock level at a given point in time */
function getStockAt(sku: string, warehouse: string, atTimestamp: number): number {
  // TODO: filter eventStore for events up to atTimestamp, compute level
  throw new Error("Not implemented");
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const r: string[] = [];

  const stockView = new StockLevelView();
  const whView = new WarehouseSummaryView();
  const cmd = new InventoryCommandHandler();

  cmd.receiveStock("KB-001", "WH-EAST", 100);
  cmd.receiveStock("KB-001", "WH-WEST", 50);
  cmd.receiveStock("MS-001", "WH-EAST", 200);
  const tsAfterReceive = Date.now();

  cmd.shipStock("KB-001", "WH-EAST", 30);
  cmd.shipStock("MS-001", "WH-EAST", 150);
  cmd.adjustStock("MS-001", "WH-EAST", -10); // damaged

  // T1: Stock levels
  r.push(stockView.getLevel("KB-001", "WH-EAST") === 70 ? "✅ T1: KB-001 EAST=70" : `❌ T1: ${stockView.getLevel("KB-001","WH-EAST")}`);
  r.push(stockView.getLevel("KB-001", "WH-WEST") === 50 ? "✅ T2: KB-001 WEST=50" : "❌ T2");
  r.push(stockView.getLevel("MS-001", "WH-EAST") === 40 ? "✅ T3: MS-001 EAST=40" : `❌ T3: ${stockView.getLevel("MS-001","WH-EAST")}`);

  // T4: Low stock
  const low = stockView.getLowStock(50);
  r.push(low.some(l => l.sku === "MS-001") ? "✅ T4: MS-001 is low stock" : "❌ T4");

  // T5: Warehouse summary
  const eastSummary = whView.getSummary("WH-EAST");
  r.push(eastSummary.skuCount === 2 ? "✅ T5: EAST 2 SKUs" : `❌ T5: ${eastSummary.skuCount}`);
  r.push(eastSummary.totalUnits === 110 ? "✅ T6: EAST total=110" : `❌ T6: ${eastSummary.totalUnits}`);

  // T7: Insufficient stock throws
  let threw = false;
  try { cmd.shipStock("KB-001", "WH-EAST", 999); } catch { threw = true; }
  r.push(threw ? "✅ T7: Insufficient stock" : "❌ T7");

  // T8: Time travel
  const pastLevel = getStockAt("KB-001", "WH-EAST", tsAfterReceive);
  r.push(pastLevel === 100 ? "✅ T8: Time travel=100" : `❌ T8: past=${pastLevel}`);

  // T9: Event store
  r.push(eventStore.length === 6 ? "✅ T9: 6 events stored" : `❌ T9: ${eventStore.length}`);

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
