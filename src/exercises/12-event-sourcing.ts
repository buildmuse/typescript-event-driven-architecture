/**
 * ═══════════════════════════════════════════════
 * EXERCISE 12: Event Sourcing — Bank Account
 * ═══════════════════════════════════════════════
 * 
 * THE interview favorite. Store state as sequence of events.
 * Rebuild current state by replaying events from the beginning.
 * 
 * Commands → validate → produce Event → apply to state
 */

interface DomainEvent {
  type: string;
  aggregateId: string;
  payload: any;
  version: number;
  timestamp: number;
}

interface AccountState {
  id: string;
  balance: number;
  status: "active" | "frozen" | "closed";
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class EventStore {
  private events: DomainEvent[] = [];

  append(event: Omit<DomainEvent, "timestamp">): DomainEvent {
    // TODO: add timestamp, store, return the stored event
    throw new Error("Not implemented");
  }

  getEvents(aggregateId: string): DomainEvent[] {
    // TODO: return events for this aggregate, sorted by version
    throw new Error("Not implemented");
  }

  getAllEvents(): DomainEvent[] {
    // TODO
    throw new Error("Not implemented");
  }
}

class BankAccount {
  // TODO: internal state

  apply(event: DomainEvent): void {
    // TODO: update state based on event type
    // "AccountOpened" → set balance to payload.initialDeposit, status = "active"
    // "MoneyDeposited" → add payload.amount to balance
    // "MoneyWithdrawn" → subtract payload.amount from balance
    // "AccountFrozen" → set status = "frozen"
    throw new Error("Not implemented");
  }

  getState(): AccountState {
    // TODO
    throw new Error("Not implemented");
  }
}

class BankAccountService {
  constructor(private store: EventStore) {}

  openAccount(accountId: string, initialDeposit: number): void {
    // TODO: create AccountOpened event, append to store
    throw new Error("Not implemented");
  }

  deposit(accountId: string, amount: number): void {
    // TODO: rehydrate account, validate active, create MoneyDeposited event
    throw new Error("Not implemented");
  }

  withdraw(accountId: string, amount: number): void {
    // TODO: rehydrate, validate active + sufficient balance, create MoneyWithdrawn
    throw new Error("Not implemented");
  }

  freezeAccount(accountId: string): void {
    // TODO: rehydrate, create AccountFrozen event
    throw new Error("Not implemented");
  }

  getAccount(accountId: string): AccountState {
    // TODO: rehydrate from events and return current state
    throw new Error("Not implemented");
  }

  private rehydrate(accountId: string): BankAccount {
    // TODO: create new BankAccount, replay all events, return it
    throw new Error("Not implemented");
  }

  private getNextVersion(accountId: string): number {
    // TODO: return next version number for this aggregate
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];
  const store = new EventStore();
  const service = new BankAccountService(store);

  // T1: Open account
  service.openAccount("ACC-1", 1000);
  const state1 = service.getAccount("ACC-1");
  results.push(state1.balance === 1000 && state1.status === "active" ? "✅ T1: Open account" : "❌ T1: Open account");

  // T2: Deposit
  service.deposit("ACC-1", 500);
  results.push(service.getAccount("ACC-1").balance === 1500 ? "✅ T2: Deposit" : "❌ T2: Deposit");

  // T3: Withdraw
  service.withdraw("ACC-1", 300);
  results.push(service.getAccount("ACC-1").balance === 1200 ? "✅ T3: Withdraw" : "❌ T3: Withdraw");

  // T4: Insufficient funds throws
  let threw = false;
  try { service.withdraw("ACC-1", 5000); } catch { threw = true; }
  results.push(threw ? "✅ T4: Insufficient funds" : "❌ T4: Should throw");

  // T5: Freeze prevents operations
  service.freezeAccount("ACC-1");
  results.push(service.getAccount("ACC-1").status === "frozen" ? "✅ T5: Frozen" : "❌ T5: Frozen");

  let threw2 = false;
  try { service.deposit("ACC-1", 100); } catch { threw2 = true; }
  results.push(threw2 ? "✅ T6: Can't deposit to frozen" : "❌ T6: Should throw for frozen");

  // T7: Event store has all events
  const events = store.getEvents("ACC-1");
  results.push(events.length === 4 ? "✅ T7: 4 events stored" : `❌ T7: ${events.length} events`);

  // T8: Versions are sequential
  const versions = events.map((e) => e.version);
  results.push(
    versions.join(",") === "1,2,3,4"
      ? "✅ T8: Sequential versions"
      : `❌ T8: versions=[${versions}]`
  );

  // T9: Multiple accounts are independent
  service.openAccount("ACC-2", 500);
  service.deposit("ACC-2", 200);
  results.push(
    service.getAccount("ACC-2").balance === 700 && service.getAccount("ACC-1").balance === 1200
      ? "✅ T9: Independent accounts"
      : "❌ T9: Independent accounts"
  );

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
