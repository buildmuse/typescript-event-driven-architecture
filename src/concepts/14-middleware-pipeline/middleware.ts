/**
 * ============================================================
 * CONCEPT 14: Middleware Pipeline
 * ============================================================
 * 
 * Chain of processors that events flow through.
 * Like Express.js middleware or Java Servlet Filters.
 */

console.log("═══ Middleware Pipeline ═══\n");

type Context = Record<string, any>;
type Next = () => Promise<void>;
type MiddlewareFn = (ctx: Context, next: Next) => Promise<void>;

class Pipeline {
  private middlewares: MiddlewareFn[] = [];

  use(fn: MiddlewareFn): this {
    this.middlewares.push(fn);
    return this;
  }

  async execute(ctx: Context): Promise<Context> {
    let idx = 0;

    const next = async (): Promise<void> => {
      if (idx < this.middlewares.length) {
        const mw = this.middlewares[idx++];
        await mw(ctx, next);
      }
    };

    await next();
    return ctx;
  }
}

const pipeline = new Pipeline();

// 1. Timestamp middleware
pipeline.use(async (ctx, next) => {
  ctx.startTime = Date.now();
  console.log(`  [1. Timestamp] Start`);
  await next();
  ctx.duration = Date.now() - ctx.startTime;
  console.log(`  [1. Timestamp] Done in ${ctx.duration}ms`);
});

// 2. Validation
pipeline.use(async (ctx, next) => {
  if (!ctx.userId) {
    ctx.error = "Missing userId";
    console.log(`  [2. Validate] ❌ Failed`);
    return; // Stop pipeline
  }
  console.log(`  [2. Validate] ✅ Passed`);
  await next();
});

// 3. Auth
pipeline.use(async (ctx, next) => {
  ctx.isAdmin = ctx.userId === "admin";
  console.log(`  [3. Auth] isAdmin: ${ctx.isAdmin}`);
  await next();
});

// 4. Handler
pipeline.use(async (ctx, next) => {
  console.log(`  [4. Handler] Processing for ${ctx.userId}`);
  ctx.result = { status: "ok" };
  await next();
});

(async () => {
  console.log("── Valid request ──");
  const result = await pipeline.execute({ userId: "admin", action: "read" });
  console.log(`  Result:`, result.result);

  console.log("\n── Invalid request ──");
  const failed = await pipeline.execute({ action: "read" });
  console.log(`  Error:`, failed.error);

  console.log("\n✅ Concept 14 Complete! Run: npm run concept:circuit-breaker");
})();
