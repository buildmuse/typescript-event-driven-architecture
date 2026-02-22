/**
 * ═══════════════════════════════════════════════
 * EXERCISE 06: Observer Pattern — Stock Ticker
 * ═══════════════════════════════════════════════
 * 
 * Implement Subject/Observer for a stock price feed.
 * 
 * StockFeed (Subject):
 * - addObserver, removeObserver, notifyAll
 * - updatePrice(symbol, price) triggers notification
 * 
 * PriceLogger (Observer): logs every price update
 * ThresholdAlert (Observer): alerts when price crosses a threshold
 * MovingAverageTracker (Observer): tracks last N prices, computes average
 */

interface StockUpdate {
  symbol: string;
  price: number;
  timestamp: number;
}

interface Observer {
  update(data: StockUpdate): void;
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class StockFeed {
  // TODO: manage observers, implement Subject interface

  addObserver(observer: Observer): void { throw new Error("Not implemented"); }
  removeObserver(observer: Observer): void { throw new Error("Not implemented"); }

  updatePrice(symbol: string, price: number): void {
    // TODO: create StockUpdate, notify all observers
    throw new Error("Not implemented");
  }

  get observerCount(): number { throw new Error("Not implemented"); }
}

class PriceLogger implements Observer {
  public log: StockUpdate[] = [];

  update(data: StockUpdate): void {
    // TODO: push to log
    throw new Error("Not implemented");
  }
}

class ThresholdAlert implements Observer {
  public alerts: Array<{ symbol: string; price: number; direction: "above" | "below" }> = [];

  constructor(private symbol: string, private threshold: number) {}

  update(data: StockUpdate): void {
    // TODO: if data.symbol matches AND price crosses threshold, record alert
    // "above" if price >= threshold, "below" if price < threshold
    // Only alert on CHANGES (don't alert twice for same direction)
    throw new Error("Not implemented");
  }
}

class MovingAverageTracker implements Observer {
  private prices = new Map<string, number[]>();

  constructor(private windowSize: number) {}

  update(data: StockUpdate): void {
    // TODO: track last `windowSize` prices per symbol
    throw new Error("Not implemented");
  }

  getAverage(symbol: string): number {
    // TODO: return average of last windowSize prices
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  const feed = new StockFeed();
  const logger = new PriceLogger();
  const alert = new ThresholdAlert("AAPL", 200);
  const avg = new MovingAverageTracker(3);

  feed.addObserver(logger);
  feed.addObserver(alert);
  feed.addObserver(avg);

  results.push(feed.observerCount === 3 ? "✅ T1: Observer count" : "❌ T1: Observer count");

  // Feed prices
  feed.updatePrice("AAPL", 190);
  feed.updatePrice("AAPL", 195);
  feed.updatePrice("AAPL", 205);
  feed.updatePrice("AAPL", 210);
  feed.updatePrice("AAPL", 195);
  feed.updatePrice("GOOG", 150);

  // T2: Logger captured all updates
  results.push(logger.log.length === 6 ? "✅ T2: Logger got all" : `❌ T2: Logger — got ${logger.log.length}`);

  // T3: Alert triggered on crossing above 200
  const aboveAlerts = alert.alerts.filter((a) => a.direction === "above");
  results.push(aboveAlerts.length >= 1 ? "✅ T3: Above threshold alert" : "❌ T3: Above threshold alert");

  // T4: Alert triggered on crossing below 200
  const belowAlerts = alert.alerts.filter((a) => a.direction === "below");
  results.push(belowAlerts.length >= 1 ? "✅ T4: Below threshold alert" : "❌ T4: Below threshold alert");

  // T5: Moving average (last 3 AAPL prices: 210, 195, and one before)
  const aaplAvg = avg.getAverage("AAPL");
  // Last 3 AAPL: 205, 210, 195 → avg = 203.33
  results.push(
    Math.abs(aaplAvg - 203.33) < 1
      ? "✅ T5: Moving average"
      : `❌ T5: Moving average — got ${aaplAvg}`
  );

  // T6: Remove observer
  feed.removeObserver(logger);
  results.push(feed.observerCount === 2 ? "✅ T6: Remove observer" : "❌ T6: Remove observer");

  // T7: GOOG average (only 1 price, window=3)
  results.push(avg.getAverage("GOOG") === 150 ? "✅ T7: Single price avg" : "❌ T7: Single price avg");

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
