/**
 * ═══════════════════════════════════════════════
 * EXERCISE 13: Build Projections from Event Stream
 * ═══════════════════════════════════════════════
 * 
 * Given a stream of e-commerce events, build DIFFERENT read models (projections).
 * Same events → different views optimized for different queries.
 */

interface Event {
  type: "ProductAdded" | "ProductPurchased" | "ProductReviewed";
  productId: string;
  payload: any;
  timestamp: number;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

/** Projection 1: Product catalog — name, price, whether in stock */
class CatalogProjection {
  project(events: Event[]): Map<string, { name: string; price: number; stock: number }> {
    // TODO: ProductAdded → add product (payload: {name, price, stock})
    //       ProductPurchased → decrement stock by payload.quantity
    throw new Error("Not implemented");
  }
}

/** Projection 2: Sales leaderboard — total revenue per product */
class SalesProjection {
  project(events: Event[]): Array<{ productId: string; totalRevenue: number; unitsSold: number }> {
    // TODO: ProductPurchased has {quantity, unitPrice}
    // Return sorted by totalRevenue descending
    throw new Error("Not implemented");
  }
}

/** Projection 3: Review summary — average rating per product */
class ReviewProjection {
  project(events: Event[]): Map<string, { avgRating: number; count: number }> {
    // TODO: ProductReviewed has {rating: 1-5}
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  const events: Event[] = [
    { type: "ProductAdded", productId: "P1", payload: { name: "Keyboard", price: 100, stock: 50 }, timestamp: 1 },
    { type: "ProductAdded", productId: "P2", payload: { name: "Mouse", price: 50, stock: 100 }, timestamp: 2 },
    { type: "ProductPurchased", productId: "P1", payload: { quantity: 3, unitPrice: 100 }, timestamp: 3 },
    { type: "ProductPurchased", productId: "P2", payload: { quantity: 10, unitPrice: 50 }, timestamp: 4 },
    { type: "ProductPurchased", productId: "P1", payload: { quantity: 2, unitPrice: 100 }, timestamp: 5 },
    { type: "ProductReviewed", productId: "P1", payload: { rating: 5 }, timestamp: 6 },
    { type: "ProductReviewed", productId: "P1", payload: { rating: 3 }, timestamp: 7 },
    { type: "ProductReviewed", productId: "P2", payload: { rating: 4 }, timestamp: 8 },
  ];

  // Catalog
  const catalog = new CatalogProjection().project(events);
  results.push(catalog.get("P1")?.stock === 45 ? "✅ T1: P1 stock=45" : `❌ T1: stock=${catalog.get("P1")?.stock}`);
  results.push(catalog.get("P2")?.stock === 90 ? "✅ T2: P2 stock=90" : `❌ T2: stock=${catalog.get("P2")?.stock}`);
  results.push(catalog.get("P1")?.name === "Keyboard" ? "✅ T3: Catalog name" : "❌ T3: Catalog name");

  // Sales
  const sales = new SalesProjection().project(events);
  results.push(sales[0]?.productId === "P1" ? "✅ T4: P1 top seller" : "❌ T4: P1 should be top");
  results.push(sales[0]?.totalRevenue === 500 ? "✅ T5: Revenue=500" : `❌ T5: revenue=${sales[0]?.totalRevenue}`);
  results.push(sales[0]?.unitsSold === 5 ? "✅ T6: Units=5" : `❌ T6: units=${sales[0]?.unitsSold}`);

  // Reviews
  const reviews = new ReviewProjection().project(events);
  results.push(reviews.get("P1")?.avgRating === 4 ? "✅ T7: P1 avg=4" : `❌ T7: avg=${reviews.get("P1")?.avgRating}`);
  results.push(reviews.get("P1")?.count === 2 ? "✅ T8: P1 count=2" : "❌ T8: P1 count");
  results.push(reviews.get("P2")?.avgRating === 4 ? "✅ T9: P2 avg=4" : "❌ T9: P2 avg");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
