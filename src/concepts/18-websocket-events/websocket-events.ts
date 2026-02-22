/**
 * ============================================================
 * CONCEPT 18: WebSocket-Style Events
 * ============================================================
 * 
 * Simulates WebSocket bidirectional event communication.
 * Patterns: rooms, broadcasting, presence, acknowledgments.
 */

import { EventEmitter } from "events";

console.log("═══ WebSocket Event Patterns ═══\n");

// Simulate WebSocket server
class WSServer extends EventEmitter {
  private clients = new Map<string, WSClient>();
  private rooms = new Map<string, Set<string>>();

  connect(client: WSClient): void {
    this.clients.set(client.id, client);
    console.log(`  📡 ${client.id} connected`);
    this.emit("connection", client);
  }

  disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all rooms
    for (const [room, members] of this.rooms) {
      if (members.has(clientId)) {
        members.delete(clientId);
        this.toRoom(room, "user:left", { userId: clientId });
      }
    }

    this.clients.delete(clientId);
    console.log(`  📡 ${clientId} disconnected`);
  }

  joinRoom(clientId: string, room: string): void {
    if (!this.rooms.has(room)) this.rooms.set(room, new Set());
    this.rooms.get(room)!.add(clientId);
    this.toRoom(room, "user:joined", { userId: clientId, room });
  }

  // Send to specific client
  toClient(clientId: string, event: string, data: any): void {
    this.clients.get(clientId)?.receive(event, data);
  }

  // Broadcast to room
  toRoom(room: string, event: string, data: any, excludeId?: string): void {
    const members = this.rooms.get(room);
    if (!members) return;
    for (const id of members) {
      if (id !== excludeId) {
        this.clients.get(id)?.receive(event, data);
      }
    }
  }

  // Broadcast to all
  broadcast(event: string, data: any, excludeId?: string): void {
    for (const [id, client] of this.clients) {
      if (id !== excludeId) client.receive(event, data);
    }
  }

  getRoomMembers(room: string): string[] {
    return Array.from(this.rooms.get(room) ?? []);
  }
}

class WSClient extends EventEmitter {
  constructor(public id: string, private server: WSServer) {
    super();
  }

  // Send event to server
  send(event: string, data: any): void {
    this.server.emit(`client:${event}`, { clientId: this.id, data });
  }

  // Receive event from server
  receive(event: string, data: any): void {
    console.log(`    [${this.id}] ← ${event}: ${JSON.stringify(data)}`);
    this.emit(event, data);
  }

  join(room: string): void {
    this.server.joinRoom(this.id, room);
  }
}

// ── Demo ──
const server = new WSServer();

const alice = new WSClient("alice", server);
const bob = new WSClient("bob", server);
const charlie = new WSClient("charlie", server);

server.connect(alice);
server.connect(bob);
server.connect(charlie);

// Join rooms
alice.join("general");
bob.join("general");
charlie.join("general");
alice.join("engineering");

console.log("\n── Room broadcast ──");
server.toRoom("general", "message", { text: "Hello room!", from: "system" });

console.log("\n── Direct message ──");
server.toClient("alice", "dm", { from: "bob", text: "Hey Alice!" });

console.log("\n── Broadcast (exclude sender) ──");
server.broadcast("announcement", { text: "Server maintenance at 10pm" }, "alice");

console.log(`\n  Room 'general' members: ${server.getRoomMembers("general")}`);
console.log(`  Room 'engineering' members: ${server.getRoomMembers("engineering")}`);

server.disconnect("charlie");
console.log(`  Room 'general' after disconnect: ${server.getRoomMembers("general")}`);

console.log("\n✅ All 18 concepts complete! Now tackle the scenarios: npm run scenario:order");
