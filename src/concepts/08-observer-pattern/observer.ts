/**
 * ============================================================
 * CONCEPT 08: Observer Pattern
 * ============================================================
 * 
 * One-to-many dependency: when subject changes, all observers notified.
 * Foundation of reactive programming.
 * 
 * Java Parallel: java.util.Observer (deprecated), PropertyChangeListener
 */

// ─────────────────────────────────────────────
// 1. CLASSIC OBSERVER
// ─────────────────────────────────────────────
console.log("═══ 1. Classic Observer ═══\n");

interface Observer<T> {
  update(data: T): void;
}

interface Subject<T> {
  subscribe(observer: Observer<T>): void;
  unsubscribe(observer: Observer<T>): void;
  notify(data: T): void;
}

class StockTicker implements Subject<{ symbol: string; price: number }> {
  private observers = new Set<Observer<{ symbol: string; price: number }>>();

  subscribe(observer: Observer<{ symbol: string; price: number }>): void {
    this.observers.add(observer);
  }

  unsubscribe(observer: Observer<{ symbol: string; price: number }>): void {
    this.observers.delete(observer);
  }

  notify(data: { symbol: string; price: number }): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }

  updatePrice(symbol: string, price: number): void {
    console.log(`  📈 ${symbol}: $${price}`);
    this.notify({ symbol, price });
  }
}

class PriceDisplay implements Observer<{ symbol: string; price: number }> {
  constructor(private name: string) {}
  update(data: { symbol: string; price: number }): void {
    console.log(`    [${this.name}] ${data.symbol} = $${data.price}`);
  }
}

class PriceAlert implements Observer<{ symbol: string; price: number }> {
  constructor(private symbol: string, private threshold: number) {}
  update(data: { symbol: string; price: number }): void {
    if (data.symbol === this.symbol && data.price > this.threshold) {
      console.log(`    🚨 ALERT: ${data.symbol} exceeded $${this.threshold}!`);
    }
  }
}

const ticker = new StockTicker();
const display = new PriceDisplay("Dashboard");
const alert = new PriceAlert("AAPL", 200);

ticker.subscribe(display);
ticker.subscribe(alert);

ticker.updatePrice("AAPL", 195);
ticker.updatePrice("AAPL", 205);
ticker.updatePrice("GOOG", 150);

// ─────────────────────────────────────────────
// 2. REACTIVE OBSERVABLE (Mini RxJS)
// ─────────────────────────────────────────────
console.log("\n═══ 2. Reactive Observable ═══\n");

type Subscriber<T> = {
  next: (value: T) => void;
  error?: (err: Error) => void;
  complete?: () => void;
};

class Observable<T> {
  constructor(
    private subscribeFn: (subscriber: Subscriber<T>) => () => void
  ) {}

  subscribe(subscriber: Subscriber<T>): { unsubscribe: () => void } {
    const teardown = this.subscribeFn(subscriber);
    return { unsubscribe: teardown };
  }

  // Operators - chainable transformations
  map<R>(transform: (value: T) => R): Observable<R> {
    return new Observable<R>((sub) => {
      const inner = this.subscribe({
        next: (val) => sub.next(transform(val)),
        error: sub.error,
        complete: sub.complete,
      });
      return () => inner.unsubscribe();
    });
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    return new Observable<T>((sub) => {
      const inner = this.subscribe({
        next: (val) => { if (predicate(val)) sub.next(val); },
        error: sub.error,
        complete: sub.complete,
      });
      return () => inner.unsubscribe();
    });
  }

  take(count: number): Observable<T> {
    return new Observable<T>((sub) => {
      let taken = 0;
      const inner = this.subscribe({
        next: (val) => {
          if (taken < count) {
            taken++;
            sub.next(val);
            if (taken === count) {
              sub.complete?.();
              inner.unsubscribe();
            }
          }
        },
        error: sub.error,
      });
      return () => inner.unsubscribe();
    });
  }

  // Create from interval
  static interval(ms: number): Observable<number> {
    return new Observable<number>((sub) => {
      let count = 0;
      const id = setInterval(() => sub.next(count++), ms);
      return () => clearInterval(id);
    });
  }

  // Create from array
  static from<T>(items: T[]): Observable<T> {
    return new Observable<T>((sub) => {
      for (const item of items) sub.next(item);
      sub.complete?.();
      return () => {};
    });
  }
}

// Usage
const numbers = Observable.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

numbers
  .filter((n) => n % 2 === 0)     // Even numbers
  .map((n) => n * n)               // Square them
  .take(3)                         // Only first 3
  .subscribe({
    next: (val) => console.log(`  Value: ${val}`),
    complete: () => console.log(`  Done!`),
  });

// ─────────────────────────────────────────────
// 3. REACTIVE STATE STORE (like Redux)
// ─────────────────────────────────────────────
console.log("\n═══ 3. Reactive State Store ═══\n");

type Reducer<S, A> = (state: S, action: A) => S;

class Store<S, A extends { type: string }> {
  private state: S;
  private observers = new Set<(state: S) => void>();
  private actionLog: A[] = [];

  constructor(private reducer: Reducer<S, A>, initialState: S) {
    this.state = initialState;
  }

  getState(): S {
    return this.state;
  }

  dispatch(action: A): void {
    this.actionLog.push(action);
    this.state = this.reducer(this.state, action);
    this.observers.forEach((obs) => obs(this.state));
  }

  subscribe(observer: (state: S) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  // Select a slice of state (like Redux selectors)
  select<R>(selector: (state: S) => R): Observable<R> {
    return new Observable<R>((sub) => {
      let prev = selector(this.state);
      sub.next(prev);
      const unsub = this.subscribe((state) => {
        const next = selector(state);
        if (next !== prev) {
          prev = next;
          sub.next(next);
        }
      });
      return unsub;
    });
  }
}

// Todo app state
interface TodoState {
  todos: Array<{ id: number; text: string; done: boolean }>;
  filter: "all" | "active" | "completed";
}

type TodoAction =
  | { type: "ADD_TODO"; text: string }
  | { type: "TOGGLE_TODO"; id: number }
  | { type: "SET_FILTER"; filter: TodoState["filter"] };

const todoReducer: Reducer<TodoState, TodoAction> = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        ...state,
        todos: [...state.todos, { id: state.todos.length + 1, text: action.text, done: false }],
      };
    case "TOGGLE_TODO":
      return {
        ...state,
        todos: state.todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    default:
      return state;
  }
};

const store = new Store(todoReducer, { todos: [], filter: "all" as const });

// Subscribe to state changes
store.subscribe((state) => {
  const active = state.todos.filter((t) => !t.done).length;
  console.log(`  📋 ${state.todos.length} todos, ${active} active`);
});

store.dispatch({ type: "ADD_TODO", text: "Study Event Sourcing" });
store.dispatch({ type: "ADD_TODO", text: "Practice Saga Pattern" });
store.dispatch({ type: "TOGGLE_TODO", id: 1 });

console.log("\n  Final state:", JSON.stringify(store.getState(), null, 2));
console.log("\n✅ Concept 08 Complete! Run: npm run concept:mediator");
