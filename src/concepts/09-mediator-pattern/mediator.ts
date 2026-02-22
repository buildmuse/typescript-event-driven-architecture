/**
 * ============================================================
 * CONCEPT 09: Mediator Pattern
 * ============================================================
 * 
 * Components communicate through a mediator instead of directly.
 * Reduces coupling from many-to-many → many-to-one-to-many.
 * 
 * Java Parallel: Spring's ApplicationContext acting as mediator
 */

console.log("═══ Mediator Pattern ═══\n");

// ─────────────────────────────────────────────
// Chat Room Mediator
// ─────────────────────────────────────────────

interface ChatUser {
  name: string;
  receive(from: string, message: string): void;
}

class ChatRoom {
  private users = new Map<string, ChatUser>();

  join(user: ChatUser): void {
    this.users.set(user.name, user);
    this.broadcast("System", `${user.name} joined the room`);
  }

  leave(userName: string): void {
    this.users.delete(userName);
    this.broadcast("System", `${userName} left the room`);
  }

  send(from: string, to: string, message: string): void {
    const recipient = this.users.get(to);
    if (recipient) {
      recipient.receive(from, message);
    } else {
      console.log(`  [Error] ${to} not found`);
    }
  }

  broadcast(from: string, message: string): void {
    for (const [name, user] of this.users) {
      if (name !== from) {
        user.receive(from, message);
      }
    }
  }
}

class Participant implements ChatUser {
  constructor(public name: string, private room: ChatRoom) {}

  receive(from: string, message: string): void {
    console.log(`  [${this.name}] Message from ${from}: ${message}`);
  }

  send(to: string, message: string): void {
    this.room.send(this.name, to, message);
  }

  shout(message: string): void {
    this.room.broadcast(this.name, message);
  }
}

const room = new ChatRoom();
const alice = new Participant("Alice", room);
const bob = new Participant("Bob", room);
const charlie = new Participant("Charlie", room);

room.join(alice);
room.join(bob);
room.join(charlie);

alice.send("Bob", "Hey Bob!");
bob.shout("Hello everyone!");
room.leave("Charlie");

// ─────────────────────────────────────────────
// Request/Command Mediator (like MediatR in .NET)
// ─────────────────────────────────────────────
console.log("\n═══ Command Mediator (MediatR-style) ═══\n");

interface Request<TResponse> {
  type: string;
}

type RequestHandler<TReq, TRes> = (request: TReq) => Promise<TRes>;

class Mediator {
  private handlers = new Map<string, RequestHandler<any, any>>();
  private pipeline: Array<(req: any, next: () => Promise<any>) => Promise<any>> = [];

  register<TReq extends Request<TRes>, TRes>(
    type: string,
    handler: RequestHandler<TReq, TRes>
  ): void {
    this.handlers.set(type, handler);
  }

  addBehavior(behavior: (req: any, next: () => Promise<any>) => Promise<any>): void {
    this.pipeline.push(behavior);
  }

  async send<TRes>(request: Request<TRes> & Record<string, any>): Promise<TRes> {
    const handler = this.handlers.get(request.type);
    if (!handler) throw new Error(`No handler for ${request.type}`);

    // Execute pipeline
    let idx = 0;
    const next = async (): Promise<TRes> => {
      if (idx < this.pipeline.length) {
        return this.pipeline[idx++](request, next);
      }
      return handler(request);
    };

    return next();
  }
}

const mediator = new Mediator();

// Add logging behavior
mediator.addBehavior(async (req, next) => {
  console.log(`  [Log] Handling: ${req.type}`);
  const start = Date.now();
  const result = await next();
  console.log(`  [Log] Done: ${req.type} (${Date.now() - start}ms)`);
  return result;
});

// Register handlers
mediator.register("GetUser", async (req: any) => {
  return { id: req.userId, name: "Buildmuse" };
});

mediator.register("CreateOrder", async (req: any) => {
  return { orderId: `ORD-${Date.now()}`, status: "created" };
});

(async () => {
  const user = await mediator.send({ type: "GetUser", userId: "U-001" });
  console.log(`  User:`, user);

  const order = await mediator.send({ type: "CreateOrder", items: ["keyboard"] });
  console.log(`  Order:`, order);

  console.log("\n✅ Concept 09 Complete! Run: npm run concept:async-queue");
})();
