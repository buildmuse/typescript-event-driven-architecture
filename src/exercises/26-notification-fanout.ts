/**
 * ═══════════════════════════════════════════════
 * EXERCISE 26: Notification Fan-Out System (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 40 minutes
 * 
 * One event → multiple notification channels.
 * Route based on event type and user preferences.
 * Rate limit per user. Priority bypass for urgent.
 */

type Channel = "email" | "sms" | "push";

interface NotifEvent {
  type: string;
  userId: string;
  payload: any;
  priority: "urgent" | "normal";
}

interface UserPrefs {
  channels: Channel[];
}

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

class NotificationRouter {
  private userPrefs = new Map<string, UserPrefs>();
  private sent: Array<{ userId: string; channel: Channel; message: string }> = [];
  private rateLimitWindow = new Map<string, number[]>(); // userId → timestamps

  constructor(private maxPerMinute: number) {}

  setPreferences(userId: string, prefs: UserPrefs): void {
    // TODO
    throw new Error("Not implemented");
  }

  async notify(event: NotifEvent, templates: Record<Channel, (p: any) => string>): Promise<{
    delivered: Array<{ channel: Channel; message: string }>;
    rateLimited: number;
  }> {
    // TODO:
    // 1. Get user's preferred channels
    // 2. For each channel: check rate limit (urgent bypasses limit)
    // 3. Apply template to generate message
    // 4. Record delivery
    // Return what was delivered and how many were rate-limited
    throw new Error("Not implemented");
  }

  getDeliveryLog(): Array<{ userId: string; channel: Channel; message: string }> {
    // TODO
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

async function verify() {
  const results: string[] = [];
  const router = new NotificationRouter(3); // max 3 per minute

  router.setPreferences("U1", { channels: ["email", "push"] });
  router.setPreferences("U2", { channels: ["sms"] });

  const templates: Record<Channel, (p: any) => string> = {
    email: (p) => `Email: ${p.text}`,
    sms: (p) => `SMS: ${p.text}`,
    push: (p) => `Push: ${p.text}`,
  };

  // T1: Fan-out to multiple channels
  const r1 = await router.notify(
    { type: "order", userId: "U1", payload: { text: "Order shipped" }, priority: "normal" },
    templates
  );
  results.push(r1.delivered.length === 2 ? "✅ T1: Fan-out to 2 channels" : `❌ T1: ${r1.delivered.length}`);

  // T2: Respects user prefs
  const r2 = await router.notify(
    { type: "alert", userId: "U2", payload: { text: "Alert!" }, priority: "normal" },
    templates
  );
  results.push(
    r2.delivered.length === 1 && r2.delivered[0].channel === "sms"
      ? "✅ T2: Respects prefs"
      : "❌ T2"
  );

  // T3: Rate limiting (U2 gets 1 per notify, after 3 notifies should be limited)
  await router.notify({ type: "a", userId: "U2", payload: { text: "2" }, priority: "normal" }, templates);
  await router.notify({ type: "a", userId: "U2", payload: { text: "3" }, priority: "normal" }, templates);
  const r3 = await router.notify(
    { type: "a", userId: "U2", payload: { text: "4" }, priority: "normal" },
    templates
  );
  results.push(r3.rateLimited > 0 ? "✅ T3: Rate limited" : "❌ T3: Should be rate limited");

  // T4: Urgent bypasses rate limit
  const r4 = await router.notify(
    { type: "critical", userId: "U2", payload: { text: "URGENT" }, priority: "urgent" },
    templates
  );
  results.push(r4.delivered.length === 1 ? "✅ T4: Urgent bypasses limit" : "❌ T4");

  // T5: Delivery log
  results.push(router.getDeliveryLog().length >= 5 ? "✅ T5: Delivery log" : "❌ T5");

  console.log("\n" + results.join("\n"));
  console.log(results.every(r => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
