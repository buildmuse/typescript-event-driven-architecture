# 🔥 Event-Driven Architecture Mastery - TypeScript

## Your Interview Battle Plan

**`/src/concepts/`** → Reference implementations to study (read-only learning)
**`/src/exercises/`** → YOUR practice ground. Skeleton + tests given. YOU implement.

---

## 📚 Concepts (Learn These First)

| # | Concept | Run Command | Difficulty |
|---|---------|-------------|------------|
| 01 | Event Emitter Basics | `npm run concept:emitter` | ⭐ |
| 02 | Typed Event Emitter | `npm run concept:typed-emitter` | ⭐ |
| 03 | Pub/Sub Pattern | `npm run concept:pubsub` | ⭐⭐ |
| 04 | Event Bus | `npm run concept:event-bus` | ⭐⭐ |
| 05 | Event Sourcing | `npm run concept:event-sourcing` | ⭐⭐⭐ |
| 06 | CQRS | `npm run concept:cqrs` | ⭐⭐⭐ |
| 07 | Saga / Orchestration | `npm run concept:saga` | ⭐⭐⭐ |
| 08 | Observer Pattern | `npm run concept:observer` | ⭐⭐ |
| 09 | Mediator Pattern | `npm run concept:mediator` | ⭐⭐ |
| 10 | Async Event Queue | `npm run concept:async-queue` | ⭐⭐⭐ |
| 11 | Backpressure Handling | `npm run concept:backpressure` | ⭐⭐⭐ |
| 12 | Dead Letter Queue | `npm run concept:dead-letter` | ⭐⭐⭐ |
| 13 | Event Replay | `npm run concept:event-replay` | ⭐⭐⭐ |
| 14 | Middleware Pipeline | `npm run concept:middleware` | ⭐⭐ |
| 15 | Circuit Breaker + Events | `npm run concept:circuit-breaker` | ⭐⭐⭐ |
| 16 | Debounce & Throttle | `npm run concept:debounce-throttle` | ⭐⭐ |
| 17 | Event Streams (Async Iterables) | `npm run concept:streams` | ⭐⭐⭐ |
| 18 | WebSocket Events | `npm run concept:websocket` | ⭐⭐⭐ |

## 🎯 Coding Scenarios (Practice These)

Each scenario has a `problem.md` (requirements) and `solution.ts` (reference implementation).
**Try coding the solution yourself first before looking at the solution!**

| # | Scenario | Run Command | Key Concepts |
|---|----------|-------------|--------------|
| 01 | Order Processing Pipeline | `npm run scenario:order` | Event Bus, Saga, DLQ |
| 02 | Notification System | `npm run scenario:notification` | Pub/Sub, Fan-out, Priority |
| 03 | Event-Driven Rate Limiter | `npm run scenario:rate-limiter` | Sliding Window, Throttle |
| 04 | Workflow Engine | `npm run scenario:workflow` | State Machine, Orchestration |
| 05 | Realtime Dashboard | `npm run scenario:realtime-dashboard` | Streams, Aggregation |
| 06 | Payment Processing | `npm run scenario:payment` | Saga, Compensation, Retry |
| 07 | Chat System | `npm run scenario:chat` | Pub/Sub, Rooms, Presence |
| 08 | Inventory Management | `npm run scenario:inventory` | Event Sourcing, CQRS |

## 🚀 Setup

```bash
npm install
npm run concept:emitter  # Start here
```

## 🧠 Study Order

**Day 1-2:** Concepts 01-04 (Foundations)
**Day 3-4:** Concepts 05-09 (Patterns)
**Day 5:** Concepts 10-18 (Advanced)
**Day 6-7:** All 8 Scenarios (Practice)
