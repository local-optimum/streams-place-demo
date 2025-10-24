# 🎨 Somnia Place

A decentralized, real-time collaborative pixel canvas powered by [Somnia Data Streams](https://datastreams.somnia.network/). Inspired by Reddit's r/place, this project demonstrates on-chain data streaming with instant real-time updates.

<img width="720" height="539" alt="image" src="https://github.com/user-attachments/assets/d1d4290f-4153-49e4-9578-2a65d038ddad" />


## 🌟 Features

- **🔗 On-Chain Persistence**: Every pixel placement is stored permanently on the Somnia blockchain
- **⚡ Real-Time Updates**: WebSocket subscriptions push pixel changes instantly to all viewers
- **🎨 16-Color Palette**: Classic r/place color scheme
- **⏱️ Cooldown System**: Configurable cooldown between placements
- **👛 Wallet Integration**: Connect with RainbowKit supporting multiple wallets
- **📊 Live Stats**: Track total pixels, unique placers, and recent activity

## 🚀 Quick Start

See [docs/QUICKSTART.md](./docs/QUICKSTART.md) for detailed setup instructions.

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Somnia testnet wallet with test tokens

### Installation

```bash
# Clone and install
git clone <your-repo-url>
cd streams-place
npm install

# Configure environment
cp env.example .env.local
# Edit .env.local with your RPC_URL, PRIVATE_KEY, etc.

# Deploy schemas to blockchain
npm run deploy:schemas

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your canvas!

## 📖 How It Works

### Data Streaming

All pixel placements follow this on-chain schema:
```typescript
"uint32 x, uint32 y, uint8 color, uint64 timestamp, address placer"
```

Real-time updates are broadcast via the `PixelPlaced` event, enabling instant synchronization across all connected clients without polling.

### Flow

1. **User places pixel** → Frontend sends coordinates and color to API
2. **Backend validates & writes** → Encodes data and calls `sdk.streams.publishData()`
3. **Real-time broadcast** → Event fires on-chain, WebSocket pushes to all subscribers
4. **Instant update** → Pixel appears on everyone's canvas immediately

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed technical architecture.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Blockchain**: Somnia Testnet
- **Data Streams**: [@somnia-chain/streams](https://www.npmjs.com/package/@somnia-chain/streams)
- **Wallet**: RainbowKit + Wagmi + Viem

## 📁 Project Structure

```
streams-place/
├── app/              # Next.js app router pages
│   ├── api/          # API routes for pixel placement
│   └── page.tsx      # Main canvas page
├── components/       # React components (Canvas, ColorPicker, etc.)
├── hooks/            # Custom React hooks for subscriptions
├── lib/              # SDK initialization and utilities
├── docs/             # Documentation
└── scripts/          # Deployment scripts
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - feel free to fork and build upon this demo!

## 🔗 Links

- [Quickstart Guide](./docs/QUICKSTART.md)
- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Somnia SDK Documentation](https://www.npmjs.com/package/@somnia-chain/streams)
- [Somnia Network](https://www.somnia.network/)

---

**Built to showcase the power of [Somnia Data Streams](https://datastreams.somnia.network/)**
