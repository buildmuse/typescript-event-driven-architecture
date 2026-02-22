/**
 * ═══════════════════════════════════════════════
 * EXERCISE 04: Wildcard Topic Matching (MQTT-style)
 * ═══════════════════════════════════════════════
 * 
 * Implement topic matching with wildcards:
 * - "+" matches exactly ONE level:  "sensors/+/temp" matches "sensors/room1/temp"
 * - "#" matches ZERO OR MORE levels: "sensors/#" matches "sensors/room1/temp"
 * - Exact match: "sensors/room1/temp" matches itself
 * 
 * Topics are "/" separated.
 */

// ══════════════════════════════════════════════
// YOUR CODE HERE
// ══════════════════════════════════════════════

function topicMatches(actualTopic: string, pattern: string): boolean {
  // TODO: implement MQTT-style wildcard matching
  throw new Error("Not implemented");
}

class WildcardPubSub {
  // TODO: store subscriptions as pattern → handler[]

  subscribe(pattern: string, handler: (topic: string, data: any) => void): () => void {
    // TODO
    throw new Error("Not implemented");
  }

  publish(topic: string, data: any): number {
    // TODO: deliver to all matching patterns, return delivery count
    throw new Error("Not implemented");
  }
}

// ══════════════════════════════════════════════
// TESTS
// ══════════════════════════════════════════════

function verify() {
  const results: string[] = [];

  // T1-T4: topicMatches function
  results.push(topicMatches("a/b/c", "a/b/c") === true ? "✅ T1: Exact match" : "❌ T1: Exact match");
  results.push(topicMatches("a/b/c", "a/+/c") === true ? "✅ T2: + wildcard" : "❌ T2: + wildcard");
  results.push(topicMatches("a/b/c", "a/#") === true ? "✅ T3: # multi-level" : "❌ T3: # multi-level");
  results.push(topicMatches("a/b", "a/b/c") === false ? "✅ T4: No match diff length" : "❌ T4: No match diff length");
  results.push(topicMatches("a/b/c/d", "a/#") === true ? "✅ T5: # matches deep" : "❌ T5: # matches deep");
  results.push(topicMatches("a", "#") === true ? "✅ T6: # matches single" : "❌ T6: # matches single");
  results.push(topicMatches("a/b", "a/+") === true ? "✅ T7: + at end" : "❌ T7: + at end");
  results.push(topicMatches("a/b/c", "a/+") === false ? "✅ T8: + one level only" : "❌ T8: + one level only");

  // T9: WildcardPubSub integration
  const ps = new WildcardPubSub();
  const got: string[] = [];

  ps.subscribe("sensors/+/temperature", (topic) => got.push("temp:" + topic));
  ps.subscribe("sensors/#", (topic) => got.push("all:" + topic));
  ps.subscribe("sensors/room1/humidity", (topic) => got.push("exact:" + topic));

  const count = ps.publish("sensors/room1/temperature", { value: 22 });
  results.push(
    got.includes("temp:sensors/room1/temperature") && got.includes("all:sensors/room1/temperature")
      ? "✅ T9: Wildcard routing works"
      : `❌ T9: Wildcard routing — got [${got}]`
  );

  // T10: Unsubscribe
  const ps2 = new WildcardPubSub();
  let hits = 0;
  const unsub = ps2.subscribe("#", () => { hits++; });
  ps2.publish("any/topic", {});
  unsub();
  ps2.publish("any/topic", {});
  results.push(hits === 1 ? "✅ T10: Unsubscribe" : `❌ T10: Unsubscribe — hits=${hits}`);

  console.log("\n" + results.join("\n"));
  console.log(results.every((r) => r.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}

verify();
