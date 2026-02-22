/**
 * ============================================================
 * CONCEPT 06: CQRS (Command Query Responsibility Segregation)
 * ============================================================
 * 
 * Separate the WRITE model (commands) from READ model (queries).
 * Often paired with Event Sourcing.
 * 
 * Java Parallel: Axon Framework CQRS, separate read/write JPA repositories
 * 
 * Why: Read and write have different scaling, optimization, and modeling needs.
 */

import { EventEmitter } from "events";

// ─────────────────────────────────────────────
// DOMAIN EVENTS
// ─────────────────────────────────────────────

interface Event {
  id: string;
  type: string;
  aggregateId: string;
  payload: any;
  timestamp: number;
}

// ─────────────────────────────────────────────
// COMMAND SIDE (Write Model)
// ─────────────────────────────────────────────
console.log("═══ CQRS - E-Commerce Example ═══\n");

// Commands = intentions to change state
interface CreateProductCommand {
  type: "CreateProduct";
  productId: string;
  name: string;
  price: number;
  stock: number;
}

interface UpdatePriceCommand {
  type: "UpdatePrice";
  productId: string;
  newPrice: number;
}

interface PurchaseCommand {
  type: "Purchase";
  productId: string;
  quantity: number;
  customerId: string;
}

type Command = CreateProductCommand | UpdatePriceCommand | PurchaseCommand;

// Event Bus connecting command side to query side
const eventBus = new EventEmitter();
const eventStore: Event[] = [];

// Command Handler - validates and produces events
class ProductCommandHandler {
  private products = new Map<string, { stock: number; price: number }>();

  handle(command: Command): Event[] {
    switch (command.type) {
      case "CreateProduct":
        return this.createProduct(command);
      case "UpdatePrice":
        return this.updatePrice(command);
      case "Purchase":
        return this.purchase(command);
    }
  }

  private createProduct(cmd: CreateProductCommand): Event[] {
    if (this.products.has(cmd.productId)) {
      throw new Error(`Product ${cmd.productId} already exists`);
    }

    this.products.set(cmd.productId, { stock: cmd.stock, price: cmd.price });

    const event: Event = {
      id: `e-${Date.now()}`,
      type: "ProductCreated",
      aggregateId: cmd.productId,
      payload: { name: cmd.name, price: cmd.price, stock: cmd.stock },
      timestamp: Date.now(),
    };

    this.publishEvents([event]);
    return [event];
  }

  private updatePrice(cmd: UpdatePriceCommand): Event[] {
    const product = this.products.get(cmd.productId);
    if (!product) throw new Error("Product not found");

    const oldPrice = product.price;
    product.price = cmd.newPrice;

    const event: Event = {
      id: `e-${Date.now()}`,
      type: "PriceUpdated",
      aggregateId: cmd.productId,
      payload: { oldPrice, newPrice: cmd.newPrice },
      timestamp: Date.now(),
    };

    this.publishEvents([event]);
    return [event];
  }

  private purchase(cmd: PurchaseCommand): Event[] {
    const product = this.products.get(cmd.productId);
    if (!product) throw new Error("Product not found");
    if (product.stock < cmd.quantity) throw new Error("Insufficient stock");

    product.stock -= cmd.quantity;

    const events: Event[] = [
      {
        id: `e-${Date.now()}-1`,
        type: "ProductPurchased",
        aggregateId: cmd.productId,
        payload: {
          customerId: cmd.customerId,
          quantity: cmd.quantity,
          totalPrice: product.price * cmd.quantity,
        },
        timestamp: Date.now(),
      },
      {
        id: `e-${Date.now()}-2`,
        type: "StockUpdated",
        aggregateId: cmd.productId,
        payload: { newStock: product.stock },
        timestamp: Date.now(),
      },
    ];

    this.publishEvents(events);
    return events;
  }

  private publishEvents(events: Event[]): void {
    for (const event of events) {
      eventStore.push(event);
      eventBus.emit("event", event); // Push to read side
    }
  }
}

// ─────────────────────────────────────────────
// QUERY SIDE (Read Models / Projections)
// ─────────────────────────────────────────────

// Read Model 1: Product Catalog (optimized for browsing)
interface ProductCatalogItem {
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
}

class ProductCatalogProjection {
  private catalog = new Map<string, ProductCatalogItem>();

  constructor() {
    // Listen to events and update read model
    eventBus.on("event", (event: Event) => this.handle(event));
  }

  private handle(event: Event): void {
    switch (event.type) {
      case "ProductCreated":
        this.catalog.set(event.aggregateId, {
          productId: event.aggregateId,
          name: event.payload.name,
          price: event.payload.price,
          inStock: event.payload.stock > 0,
        });
        break;
      case "PriceUpdated":
        const item = this.catalog.get(event.aggregateId);
        if (item) item.price = event.payload.newPrice;
        break;
      case "StockUpdated":
        const stockItem = this.catalog.get(event.aggregateId);
        if (stockItem) stockItem.inStock = event.payload.newStock > 0;
        break;
    }
  }

  // Query methods - fast, denormalized reads
  getAll(): ProductCatalogItem[] {
    return Array.from(this.catalog.values());
  }

  getInStock(): ProductCatalogItem[] {
    return this.getAll().filter((p) => p.inStock);
  }

  getByPriceRange(min: number, max: number): ProductCatalogItem[] {
    return this.getAll().filter((p) => p.price >= min && p.price <= max);
  }
}

// Read Model 2: Sales Analytics (optimized for reporting)
interface SalesReport {
  productId: string;
  totalSold: number;
  totalRevenue: number;
  purchaseCount: number;
}

class SalesAnalyticsProjection {
  private sales = new Map<string, SalesReport>();

  constructor() {
    eventBus.on("event", (event: Event) => this.handle(event));
  }

  private handle(event: Event): void {
    if (event.type !== "ProductPurchased") return;

    if (!this.sales.has(event.aggregateId)) {
      this.sales.set(event.aggregateId, {
        productId: event.aggregateId,
        totalSold: 0,
        totalRevenue: 0,
        purchaseCount: 0,
      });
    }

    const report = this.sales.get(event.aggregateId)!;
    report.totalSold += event.payload.quantity;
    report.totalRevenue += event.payload.totalPrice;
    report.purchaseCount++;
  }

  getTopSellers(limit: number): SalesReport[] {
    return Array.from(this.sales.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  getReport(productId: string): SalesReport | undefined {
    return this.sales.get(productId);
  }
}

// Read Model 3: Customer Purchase History
class CustomerHistoryProjection {
  private history = new Map<string, Array<{ productId: string; quantity: number; total: number; date: number }>>();

  constructor() {
    eventBus.on("event", (event: Event) => this.handle(event));
  }

  private handle(event: Event): void {
    if (event.type !== "ProductPurchased") return;

    const customerId = event.payload.customerId;
    if (!this.history.has(customerId)) {
      this.history.set(customerId, []);
    }

    this.history.get(customerId)!.push({
      productId: event.aggregateId,
      quantity: event.payload.quantity,
      total: event.payload.totalPrice,
      date: event.timestamp,
    });
  }

  getHistory(customerId: string) {
    return this.history.get(customerId) ?? [];
  }
}

// ─────────────────────────────────────────────
// BOOTSTRAP & RUN
// ─────────────────────────────────────────────

// Initialize read models (they subscribe to events)
const catalog = new ProductCatalogProjection();
const analytics = new SalesAnalyticsProjection();
const customerHistory = new CustomerHistoryProjection();

// Execute commands (write side)
const commandHandler = new ProductCommandHandler();

console.log("── Writing Commands ──\n");

commandHandler.handle({
  type: "CreateProduct",
  productId: "P-001",
  name: "Mechanical Keyboard",
  price: 149.99,
  stock: 50,
});

commandHandler.handle({
  type: "CreateProduct",
  productId: "P-002",
  name: "Gaming Mouse",
  price: 79.99,
  stock: 100,
});

commandHandler.handle({
  type: "Purchase",
  productId: "P-001",
  quantity: 2,
  customerId: "C-001",
});

commandHandler.handle({
  type: "Purchase",
  productId: "P-002",
  quantity: 5,
  customerId: "C-001",
});

commandHandler.handle({
  type: "UpdatePrice",
  productId: "P-001",
  newPrice: 129.99,
});

commandHandler.handle({
  type: "Purchase",
  productId: "P-001",
  quantity: 3,
  customerId: "C-002",
});

// ─────────────────────────────────────────────
// QUERIES (Read side - all projections updated)
// ─────────────────────────────────────────────

console.log("\n── Reading Queries ──\n");

console.log("  📦 Product Catalog:");
catalog.getAll().forEach((p) => {
  console.log(`    ${p.name}: $${p.price} ${p.inStock ? "✅" : "❌"}`);
});

console.log("\n  📊 Sales Analytics:");
analytics.getTopSellers(5).forEach((r) => {
  console.log(`    ${r.productId}: ${r.totalSold} sold, $${r.totalRevenue.toFixed(2)} revenue`);
});

console.log("\n  🛒 Customer C-001 History:");
customerHistory.getHistory("C-001").forEach((h) => {
  console.log(`    ${h.productId}: qty ${h.quantity}, total $${h.total}`);
});

console.log("\n  🔍 Products $50-$100:");
catalog.getByPriceRange(50, 100).forEach((p) => {
  console.log(`    ${p.name}: $${p.price}`);
});

// Show the event store
console.log("\n  📜 Event Store (Source of Truth):");
eventStore.forEach((e) => {
  console.log(`    ${e.type} | ${e.aggregateId} | ${JSON.stringify(e.payload)}`);
});

console.log("\n✅ Concept 06 Complete! Run: npm run concept:saga");
