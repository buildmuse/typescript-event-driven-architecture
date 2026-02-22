/**
 * ============================================================
 * CONCEPT 05: Event Sourcing
 * ============================================================
 * 
 * Instead of storing current state, store ALL events that led to current state.
 * Current state = replay of all events from beginning.
 * 
 * Think: Git commits. You don't store the final file - you store every change.
 * 
 * Java Parallel: Axon Framework, EventStore
 * 
 * Interview Gold: Event Sourcing is THE most asked EDA concept.
 */

// ─────────────────────────────────────────────
// 1. CORE EVENT SOURCING - Bank Account
// ─────────────────────────────────────────────
console.log("═══ 1. Event Sourcing - Bank Account ═══\n");

interface DomainEvent {
  id: string;
  aggregateId: string;
  type: string;
  payload: any;
  timestamp: number;
  version: number;
}

// Event Store - the source of truth
class EventStore {
  private events: DomainEvent[] = [];
  private snapshots = new Map<string, { state: any; version: number }>();

  append(event: Omit<DomainEvent, "id" | "timestamp">): DomainEvent {
    const stored: DomainEvent = {
      ...event,
      id: `evt-${this.events.length + 1}`,
      timestamp: Date.now(),
    };
    this.events.push(stored);
    return stored;
  }

  getEvents(aggregateId: string, afterVersion?: number): DomainEvent[] {
    return this.events
      .filter((e) => e.aggregateId === aggregateId)
      .filter((e) => (afterVersion ? e.version > afterVersion : true))
      .sort((a, b) => a.version - b.version);
  }

  getAllEvents(): DomainEvent[] {
    return [...this.events];
  }

  saveSnapshot(aggregateId: string, state: any, version: number): void {
    this.snapshots.set(aggregateId, { state: JSON.parse(JSON.stringify(state)), version });
  }

  getSnapshot(aggregateId: string): { state: any; version: number } | null {
    return this.snapshots.get(aggregateId) ?? null;
  }
}

// Bank Account Aggregate
interface AccountState {
  id: string;
  balance: number;
  status: "active" | "frozen" | "closed";
  transactions: Array<{ type: string; amount: number; date: number }>;
}

class BankAccount {
  private state: AccountState;
  private version = 0;

  constructor(id: string) {
    this.state = { id, balance: 0, status: "active", transactions: [] };
  }

  // Apply event to state (pure function - no side effects)
  apply(event: DomainEvent): void {
    switch (event.type) {
      case "ACCOUNT_OPENED":
        this.state.balance = event.payload.initialDeposit ?? 0;
        this.state.status = "active";
        break;
      case "MONEY_DEPOSITED":
        this.state.balance += event.payload.amount;
        this.state.transactions.push({
          type: "deposit",
          amount: event.payload.amount,
          date: event.timestamp,
        });
        break;
      case "MONEY_WITHDRAWN":
        this.state.balance -= event.payload.amount;
        this.state.transactions.push({
          type: "withdrawal",
          amount: event.payload.amount,
          date: event.timestamp,
        });
        break;
      case "ACCOUNT_FROZEN":
        this.state.status = "frozen";
        break;
      case "ACCOUNT_CLOSED":
        this.state.status = "closed";
        break;
    }
    this.version = event.version;
  }

  getState(): AccountState {
    return { ...this.state };
  }

  getVersion(): number {
    return this.version;
  }
}

// Command Handler - validates & produces events
class BankAccountCommandHandler {
  constructor(private store: EventStore) {}

  openAccount(accountId: string, initialDeposit: number): DomainEvent {
    const event = this.store.append({
      aggregateId: accountId,
      type: "ACCOUNT_OPENED",
      payload: { initialDeposit },
      version: 1,
    });
    console.log(`  ✅ Account opened with $${initialDeposit}`);
    return event;
  }

  deposit(accountId: string, amount: number): DomainEvent {
    // Rehydrate state to validate
    const account = this.rehydrate(accountId);
    if (account.getState().status !== "active") {
      throw new Error("Account not active");
    }

    const event = this.store.append({
      aggregateId: accountId,
      type: "MONEY_DEPOSITED",
      payload: { amount },
      version: account.getVersion() + 1,
    });
    console.log(`  💰 Deposited $${amount}`);
    return event;
  }

  withdraw(accountId: string, amount: number): DomainEvent {
    const account = this.rehydrate(accountId);
    if (account.getState().status !== "active") {
      throw new Error("Account not active");
    }
    if (account.getState().balance < amount) {
      throw new Error(`Insufficient funds. Balance: $${account.getState().balance}`);
    }

    const event = this.store.append({
      aggregateId: accountId,
      type: "MONEY_WITHDRAWN",
      payload: { amount },
      version: account.getVersion() + 1,
    });
    console.log(`  💸 Withdrew $${amount}`);
    return event;
  }

  // Rebuild state from events (THE CORE of event sourcing)
  rehydrate(accountId: string): BankAccount {
    const account = new BankAccount(accountId);
    const events = this.store.getEvents(accountId);
    
    for (const event of events) {
      account.apply(event);
    }
    
    return account;
  }
}

const store = new EventStore();
const handler = new BankAccountCommandHandler(store);

// Execute commands - each produces an event
handler.openAccount("ACC-001", 1000);
handler.deposit("ACC-001", 500);
handler.deposit("ACC-001", 250);
handler.withdraw("ACC-001", 300);

// Rebuild state from events
const account = handler.rehydrate("ACC-001");
console.log(`\n  Current state:`, account.getState());

// Show event log
console.log(`\n  Event log:`);
store.getEvents("ACC-001").forEach((e) => {
  console.log(`    v${e.version} | ${e.type} | ${JSON.stringify(e.payload)}`);
});

// ─────────────────────────────────────────────
// 2. SNAPSHOTS - Optimization for long event streams
// ─────────────────────────────────────────────
console.log("\n═══ 2. Snapshots ═══\n");

class SnapshotBankAccount extends BankAccountCommandHandler {
  private snapshotInterval = 3; // Snapshot every 3 events

  constructor(store: EventStore) {
    super(store);
  }

  rehydrateWithSnapshot(accountId: string): BankAccount {
    const account = new BankAccount(accountId);
    const snapshot = (this as any).store.getSnapshot(accountId);

    if (snapshot) {
      console.log(`  📸 Loading from snapshot at v${snapshot.version}`);
      // Apply snapshot state
      Object.assign((account as any).state, snapshot.state);
      (account as any).version = snapshot.version;

      // Only replay events after snapshot
      const events = (this as any).store.getEvents(accountId, snapshot.version);
      console.log(`  ▶️ Replaying ${events.length} events after snapshot`);
      for (const event of events) {
        account.apply(event);
      }
    } else {
      // Full replay
      const events = (this as any).store.getEvents(accountId);
      console.log(`  ▶️ Full replay of ${events.length} events`);
      for (const event of events) {
        account.apply(event);
      }
    }

    // Create snapshot if needed
    if (account.getVersion() >= this.snapshotInterval) {
      (this as any).store.saveSnapshot(accountId, account.getState(), account.getVersion());
      console.log(`  📸 Snapshot saved at v${account.getVersion()}`);
    }

    return account;
  }
}

const snapHandler = new SnapshotBankAccount(store);
const rebuilt = snapHandler.rehydrateWithSnapshot("ACC-001");
console.log(`  Balance: $${rebuilt.getState().balance}`);

// Now rehydrate again - should use snapshot
console.log("\n  Second rehydration:");
handler.deposit("ACC-001", 100);
const rebuilt2 = snapHandler.rehydrateWithSnapshot("ACC-001");
console.log(`  Balance: $${rebuilt2.getState().balance}`);

// ─────────────────────────────────────────────
// 3. PROJECTIONS - Read models from events
// ─────────────────────────────────────────────
console.log("\n═══ 3. Projections (Read Models) ═══\n");

// Build different views from the same event stream
class AccountSummaryProjection {
  private summaries = new Map<string, { totalDeposits: number; totalWithdrawals: number; txCount: number }>();

  project(events: DomainEvent[]): void {
    for (const event of events) {
      if (!this.summaries.has(event.aggregateId)) {
        this.summaries.set(event.aggregateId, { totalDeposits: 0, totalWithdrawals: 0, txCount: 0 });
      }
      const summary = this.summaries.get(event.aggregateId)!;

      switch (event.type) {
        case "MONEY_DEPOSITED":
          summary.totalDeposits += event.payload.amount;
          summary.txCount++;
          break;
        case "MONEY_WITHDRAWN":
          summary.totalWithdrawals += event.payload.amount;
          summary.txCount++;
          break;
      }
    }
  }

  getSummary(accountId: string) {
    return this.summaries.get(accountId);
  }
}

class AuditTrailProjection {
  private trail: Array<{ time: string; action: string; account: string }> = [];

  project(events: DomainEvent[]): void {
    for (const event of events) {
      this.trail.push({
        time: new Date(event.timestamp).toISOString(),
        action: event.type,
        account: event.aggregateId,
      });
    }
  }

  getTrail() {
    return this.trail;
  }
}

// Same events, different views
const allEvents = store.getAllEvents();

const summaryProjection = new AccountSummaryProjection();
summaryProjection.project(allEvents);
console.log("  Account Summary:", summaryProjection.getSummary("ACC-001"));

const auditProjection = new AuditTrailProjection();
auditProjection.project(allEvents);
console.log("  Audit Trail:", auditProjection.getTrail().slice(0, 3), "...");

// ─────────────────────────────────────────────
// 4. TIME TRAVEL - Query state at any point
// ─────────────────────────────────────────────
console.log("\n═══ 4. Time Travel ═══\n");

function getStateAtVersion(accountId: string, targetVersion: number): AccountState {
  const account = new BankAccount(accountId);
  const events = store.getEvents(accountId);

  for (const event of events) {
    if (event.version > targetVersion) break;
    account.apply(event);
  }

  return account.getState();
}

console.log("  State at v1:", getStateAtVersion("ACC-001", 1));
console.log("  State at v3:", getStateAtVersion("ACC-001", 3));
console.log("  State at v5 (latest):", getStateAtVersion("ACC-001", 5));

console.log("\n✅ Concept 05 Complete! Run: npm run concept:cqrs");
