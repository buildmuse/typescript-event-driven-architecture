/**
 * ═══════════════════════════════════════════════
 * EXERCISE 29: Chat Room with Presence (Interview Scenario)
 * ═══════════════════════════════════════════════
 * 
 * ⏱ Target: 40 minutes
 * 
 * Build a Pub/Sub chat system with rooms, presence, and message history.
 */

import { EventEmitter } from "events";

interface ChatMessage {
  roomId: string;
  userId: string;
  text: string;
  timestamp: number;
}

class ChatServer extends EventEmitter {
  join(userId: string, roomId: string): void {
    // TODO: add user to room, emit "user:joined" with {userId, roomId}
    // Broadcast system message to room
    throw new Error("Not implemented");
  }

  leave(userId: string, roomId: string): void {
    // TODO: remove from room, emit "user:left"
    throw new Error("Not implemented");
  }

  send(userId: string, roomId: string, text: string): boolean {
    // TODO: validate user is in room, store message, deliver to all OTHER members
    // Emit "message" event with ChatMessage
    // Return false if user not in room
    throw new Error("Not implemented");
  }

  getMembers(roomId: string): string[] {
    // TODO
    throw new Error("Not implemented");
  }

  getHistory(roomId: string, limit?: number): ChatMessage[] {
    // TODO: return last N messages
    throw new Error("Not implemented");
  }

  getRooms(userId: string): string[] {
    // TODO: which rooms is this user in?
    throw new Error("Not implemented");
  }
}

function verify() {
  const r: string[] = [];
  const server = new ChatServer();
  const received: Array<{userId: string; text: string}> = [];

  // Track messages delivered to bob
  server.on("message:bob", (msg: ChatMessage) => received.push({userId: msg.userId, text: msg.text}));

  server.join("alice", "general");
  server.join("bob", "general");
  server.join("charlie", "general");

  r.push(server.getMembers("general").length === 3 ? "✅ T1: 3 members" : "❌ T1");

  server.send("alice", "general", "Hello!");
  r.push(received.length === 1 && received[0].text === "Hello!" ? "✅ T2: Bob received" : "❌ T2");

  // Alice shouldn't receive her own message
  const aliceReceived: string[] = [];
  server.on("message:alice", (msg: ChatMessage) => aliceReceived.push(msg.text));
  server.send("alice", "general", "Test");
  r.push(aliceReceived.length === 0 ? "✅ T3: No self-delivery" : "❌ T3");

  // Not in room
  r.push(server.send("outsider", "general", "Hi") === false ? "✅ T4: Not in room rejected" : "❌ T4");

  // History
  r.push(server.getHistory("general").length === 2 ? "✅ T5: History" : "❌ T5");

  // Leave
  server.leave("charlie", "general");
  r.push(server.getMembers("general").length === 2 ? "✅ T6: Leave works" : "❌ T6");

  // User's rooms
  server.join("alice", "engineering");
  r.push(server.getRooms("alice").length === 2 ? "✅ T7: User rooms" : "❌ T7");

  console.log("\n" + r.join("\n"));
  console.log(r.every(x => x.startsWith("✅")) ? "\n🎉 ALL TESTS PASSED" : "\n💪 Keep going!");
}
verify();
