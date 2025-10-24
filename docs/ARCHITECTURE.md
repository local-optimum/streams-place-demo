# Somnia Place - Architecture

## Overview

Somnia Place is a collaborative pixel canvas application built on the Somnia blockchain, demonstrating real-time on-chain data persistence and streaming using Somnia Data Streams SDK.

## Why Somnia Data Streams?

Traditional blockchain applications face a choice between slow polling (checking for updates every few seconds) or complex off-chain infrastructure. Somnia Data Streams solves this with **reactive event subscriptions** that push updates instantly to clients.

### The Power of Reactivity + ethCalls

When subscribing to events, you can specify `ethCalls` - blockchain queries that run automatically when events fire. This means event notifications include both the event AND the data you need, eliminating extra round-trips:

```typescript
subscribe({
  eventId: 'PixelPlaced',
  ethCalls: [{ 
    to: STREAMS_CONTRACT,
    data: encodeFunctionData('getCanvas')
  }],
  onData: (data) => {
    // Event + canvas data arrive together!
  }
})
```

**Benefits:**
- ⚡ Instant updates (push-based)
- 🎯 Zero extra blockchain queries
- 💰 Lower costs
- 📊 Always in sync

## Architecture

```
User → Browser → API Server → Somnia Blockchain
                      ↓
                WebSocket ← Real-time Events
                      ↓
                   Browser
```

### Components

**Frontend (Client-Side)**
- Next.js 14 with React 18
- HTML5 Canvas for pixel rendering
- WebSocket subscriptions for real-time updates
- RainbowKit + Wagmi for wallet connections

**Backend (Server-Side)**
- Next.js API routes for pixel placement
- Somnia Data Streams SDK for blockchain interaction
- Server-side wallet for sponsored transactions

**Blockchain**
- Somnia Testnet
- Data Streams Protocol for storage
- WebSocket RPC for event streaming

## Data Flow

### Writing a Pixel

1. User clicks canvas and selects color
2. Frontend calls `/api/place-pixel` with coordinates
3. Server validates input and cooldown
4. Server reads current canvas state
5. Server adds new pixel to state
6. Server writes updated state atomically with event:
   ```typescript
   await sdk.streams.publishData([{
     schemaId: PIXEL_SCHEMA_ID,
     id: uniquePixelId,
     data: encodedPixelData
   }])
   ```
7. Transaction confirms and event fires

### Reading Updates

1. Browser subscribes to `PixelPlaced` events via WebSocket
2. When any user places a pixel, all subscribers receive event
3. Event includes canvas state (via ethCalls)
4. Browser updates canvas immediately
5. No polling required!

## Data Schema

### Pixel Data Schema

```typescript
const PIXEL_SCHEMA = "uint32 x, uint32 y, uint8 color, uint64 timestamp, address placer"
```

Each pixel placement stores:
- `x`, `y`: Canvas coordinates
- `color`: Index into 16-color palette (0-15)
- `timestamp`: Unix timestamp of placement
- `placer`: Wallet address of user

### Event Schema

```typescript
event PixelPlaced(
  uint32 indexed x,
  uint32 indexed y,
  uint8 color
)
```

Events enable real-time reactivity via WebSocket subscriptions. Indexed parameters allow filtering specific pixels.

## Key Patterns

### 1. Atomic Write + Event

Use `publishData()` to write state, then emit events for reactivity. This ensures data and notifications stay in sync.

### 2. Server-Side Writes, Client-Side Reads

- Server handles all writes (requires private key)
- Clients read directly from blockchain
- True decentralization with secure writes

### 3. Optimistic UI Updates

- Immediately show user's own pixel placement
- Real-time subscription confirms actual state
- Blockchain is source of truth

### 4. Zero-Latency Subscriptions

Subscribe with `ethCalls` to fetch data automatically when events fire, eliminating the need for separate data fetches.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Wallet | RainbowKit + Wagmi |
| Blockchain | Viem |
| Data Streams | @somnia-chain/streams |
| Network | Somnia Testnet |

## Deployment

### Environment Variables

```env
# Server-side only
RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=0x...

# Client-side (NEXT_PUBLIC_*)
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_WS_RPC_URL=wss://dream-rpc.somnia.network
NEXT_PUBLIC_PIXEL_SCHEMA_ID=0x...
NEXT_PUBLIC_PUBLISHER_ADDRESS=0x...
NEXT_PUBLIC_CANVAS_WIDTH=100
NEXT_PUBLIC_CANVAS_HEIGHT=100
```

### Build Commands

```bash
# Install dependencies
npm install

# Deploy schemas (first time only)
npm run deploy:schemas

# Development
npm run dev

# Production build
npm run build
npm start
```

## Security

- Server private key stored securely in environment variables
- All user inputs validated on server
- Rate limiting via cooldown system
- Bounds checking for coordinates
- Address validation for placers

---

**This architecture demonstrates how Somnia Data Streams enables real-time, collaborative on-chain applications that feel like traditional web apps while maintaining blockchain transparency and persistence.**

