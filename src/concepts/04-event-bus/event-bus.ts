/**
 * ============================================================
 * CONCEPT 04: Event Bus
 * ============================================================
 * 
 * Central nervous system of event-driven apps.
 * Think: Single channel where all components communicate.
 * 
 * Java Parallel: Google Guava EventBus, Spring ApplicationEventPublisher
 * 
 * Key differences from Pub/Sub:
 * - Single shared bus (not topic-based broker)
 * - Often in-process (not distributed)
 * - Great for decoupling modules within a service
 */

// ─────────────────────────────────────────────
// 1. SINGLETON EVENT BUS
// ─────────────────────────────────────────────
console.log("═══ 1. Singleton Event Bus ═══\n");

interface BusEvent {
  type: string;
  payload: any;
  metadata?: {
    timestamp: number;
    source: string;
    correlationId?: string;
  };
}

type BusHandler = (event: BusEvent) => void | Promise<void>;

class EventBus {
  private static instance: EventBus;
  private handlers = new Map<string, Set<BusHandler>>();
  private globalHandlers = new Set<BusHandler>();
  private history: BusEvent[] = [];

  private constructor() {} // Singleton

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(eventType: string, handler: BusHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => this.handlers.get(eventType)?.delete(handler);
  }

  // Listen to ALL events (like a logger or auditor)
  onAny(handler: BusHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  async emit(event: BusEvent): Promise<void> {
    // Add metadata if missing
    event.metadata = event.metadata ?? {
      timestamp: Date.now(),
      source: "unknown",
    };

    // Store in history
    this.history.push(event);

    // Notify specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all(Array.from(handlers).map((h) => h(event)));
    }

    // Notify global handlers
    await Promise.all(Array.from(this.globalHandlers).map((h) => h(event)));
  }

  getHistory(type?: string): BusEvent[] {
    return type
      ? this.history.filter((e) => e.type === type)
      : [...this.history];
  }

  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.history = [];
  }
}

// Usage - Decoupled modules communicating through bus
const bus = EventBus.getInstance();

// Module A: User Service
class UserService {
  private bus = EventBus.getInstance();

  async createUser(name: string, email: string): Promise<void> {
    const userId = `U-${Date.now()}`;
    console.log(`  [UserService] Created user: ${name}`);

    await this.bus.emit({
      type: "USER_CREATED",
      payload: { userId, name, email },
      metadata: { timestamp: Date.now(), source: "user-service" },
    });
  }
}

// Module B: Email Service - doesn't know about UserService
class EmailService {
  constructor() {
    const bus = EventBus.getInstance();
    bus.on("USER_CREATED", async (event) => {
      console.log(`  [EmailService] Sending welcome email to ${event.payload.email}`);
    });
  }
}

// Module C: Analytics - doesn't know about UserService
class AnalyticsService {
  constructor() {
    const bus = EventBus.getInstance();
    bus.on("USER_CREATED", async (event) => {
      console.log(`  [Analytics] Tracking signup: ${event.payload.userId}`);
    });
  }
}

// Module D: Audit Logger - listens to EVERYTHING
class AuditLogger {
  constructor() {
    const bus = EventBus.getInstance();
    bus.onAny(async (event) => {
      console.log(`  [Audit] ${event.type} from ${event.metadata?.source}`);
    });
  }
}

(async () => {
  // Bootstrap services
  new EmailService();
  new AnalyticsService();
  new AuditLogger();

  const userService = new UserService();
  await userService.createUser("Buildmuse", "dev@buildmuse.com");

  // ─────────────────────────────────────────────
  // 2. PRIORITY EVENT BUS
  // ─────────────────────────────────────────────
  console.log("\n═══ 2. Priority Event Bus ═══\n");

  type Priority = "critical" | "high" | "normal" | "low";

  interface PriorityHandler {
    priority: Priority;
    handler: BusHandler;
  }

  class PriorityEventBus {
    private handlers = new Map<string, PriorityHandler[]>();
    private priorityOrder: Record<Priority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    on(eventType: string, handler: BusHandler, priority: Priority = "normal"): void {
      if (!this.handlers.has(eventType)) {
        this.handlers.set(eventType, []);
      }
      this.handlers.get(eventType)!.push({ priority, handler });
      // Sort by priority after each addition
      this.handlers.get(eventType)!.sort(
        (a, b) => this.priorityOrder[a.priority] - this.priorityOrder[b.priority]
      );
    }

    async emit(event: BusEvent): Promise<void> {
      const handlers = this.handlers.get(event.type) ?? [];
      // Execute in priority order (critical first)
      for (const { handler, priority } of handlers) {
        console.log(`    [${priority}] handling ${event.type}...`);
        await handler(event);
      }
    }
  }

  const priorityBus = new PriorityEventBus();

  priorityBus.on("alert", async (e) => console.log("    Send email"), "low");
  priorityBus.on("alert", async (e) => console.log("    Page on-call"), "critical");
  priorityBus.on("alert", async (e) => console.log("    Update dashboard"), "normal");
  priorityBus.on("alert", async (e) => console.log("    Log to Slack"), "high");

  await priorityBus.emit({ type: "alert", payload: { severity: "critical" } });

  // ─────────────────────────────────────────────
  // 3. REQUEST-REPLY OVER EVENT BUS
  // ─────────────────────────────────────────────
  console.log("\n═══ 3. Request-Reply Pattern ═══\n");

  class RequestReplyBus {
    private bus = new Map<string, (payload: any) => Promise<any>>();

    // Register a request handler (like REST endpoint)
    handle(requestType: string, handler: (payload: any) => Promise<any>): void {
      this.bus.set(requestType, handler);
    }

    // Send request and wait for reply
    async request<T>(requestType: string, payload: any): Promise<T> {
      const handler = this.bus.get(requestType);
      if (!handler) {
        throw new Error(`No handler for request: ${requestType}`);
      }
      return handler(payload) as Promise<T>;
    }
  }

  const rrBus = new RequestReplyBus();

  // Register handlers
  rrBus.handle("GET_USER", async (payload) => {
    return { id: payload.userId, name: "Buildmuse", role: "admin" };
  });

  rrBus.handle("VALIDATE_ORDER", async (payload) => {
    return { valid: payload.amount > 0, reason: payload.amount <= 0 ? "Invalid amount" : null };
  });

  // Make requests
  const user = await rrBus.request("GET_USER", { userId: "U-001" });
  console.log(`  User:`, user);

  const validation = await rrBus.request("VALIDATE_ORDER", { amount: 99.99 });
  console.log(`  Validation:`, validation);

  // ─────────────────────────────────────────────
  // 4. EVENT BUS WITH MIDDLEWARE
  // ─────────────────────────────────────────────
  console.log("\n═══ 4. Event Bus with Middleware ═══\n");

  type Middleware = (event: BusEvent, next: () => Promise<void>) => Promise<void>;

  class MiddlewareEventBus {
    private middlewares: Middleware[] = [];
    private handlers = new Map<string, Set<BusHandler>>();

    use(middleware: Middleware): void {
      this.middlewares.push(middleware);
    }

    on(type: string, handler: BusHandler): void {
      if (!this.handlers.has(type)) {
        this.handlers.set(type, new Set());
      }
      this.handlers.get(type)!.add(handler);
    }

    async emit(event: BusEvent): Promise<void> {
      let idx = 0;

      const next = async (): Promise<void> => {
        if (idx < this.middlewares.length) {
          const middleware = this.middlewares[idx++];
          await middleware(event, next);
        } else {
          // All middleware passed, execute handlers
          const handlers = this.handlers.get(event.type) ?? new Set();
          await Promise.all(Array.from(handlers).map((h) => h(event)));
        }
      };

      await next();
    }
  }

  const mwBus = new MiddlewareEventBus();

  // Logging middleware
  mwBus.use(async (event, next) => {
    console.log(`  [LOG] → ${event.type}`);
    const start = Date.now();
    await next();
    console.log(`  [LOG] ← ${event.type} (${Date.now() - start}ms)`);
  });

  // Validation middleware
  mwBus.use(async (event, next) => {
    if (!event.payload) {
      console.log(`  [VALIDATE] Rejected: no payload`);
      return; // Stop pipeline
    }
    console.log(`  [VALIDATE] Passed`);
    await next();
  });

  // Enrichment middleware
  mwBus.use(async (event, next) => {
    event.metadata = { ...event.metadata, enrichedAt: Date.now() } as any;
    console.log(`  [ENRICH] Added metadata`);
    await next();
  });

  mwBus.on("ORDER", async (event) => {
    console.log(`  [HANDLER] Processing order: ${event.payload.orderId}`);
  });

  await mwBus.emit({ type: "ORDER", payload: { orderId: "ORD-001" } });
  console.log("---");
  await mwBus.emit({ type: "ORDER", payload: null }); // Blocked by validation

  bus.clear();
  console.log("\n✅ Concept 04 Complete! Run: npm run concept:event-sourcing");
})();
