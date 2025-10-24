# ⚡ Quick Start Guide

Get Somnia Place running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm/yarn/pnpm
- ✅ Somnia testnet wallet with test tokens
- ✅ Private key for deployment

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp env.example .env.local

# Edit .env.local with your values
nano .env.local
```

Required values:
```env
RPC_URL=https://dream-rpc.somnia.network
WS_RPC_URL=wss://dream-rpc.somnia.network
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE  # ⚠️ Keep this secret!
```

### 3. Deploy Schemas

Register your pixel data structure on-chain:

```bash
npm run deploy:schemas
```

You'll get output like:
```
✅ Schema ID: 0x123...
✅ Publisher Address: 0xabc...
```

**Copy these values** and add to your `.env.local`:
```env
NEXT_PUBLIC_PIXEL_SCHEMA_ID=0x123...
NEXT_PUBLIC_PUBLISHER_ADDRESS=0xabc...
```

### 4. Optional: WalletConnect Project ID

For better wallet support:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a free account
3. Create a new project
4. Copy the Project ID

Add to `lib/wagmi.ts`:
```typescript
projectId: 'YOUR_PROJECT_ID_HERE'
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## What's Next?

1. **Connect your wallet** using the button in the top right
2. **Click a pixel** on the canvas
3. **Choose a color** from the palette
4. **Place your pixel!**

## Troubleshooting

### Schema not registered error
- Make sure you ran `npm run deploy:schemas`
- Check that `NEXT_PUBLIC_PIXEL_SCHEMA_ID` is set in `.env.local`

### WebSocket connection fails
- Verify `WS_RPC_URL` is set correctly
- Check if Somnia testnet WebSocket endpoint is accessible

### Transaction fails
- Ensure your wallet has sufficient testnet tokens
- Check if you're on the correct network (Somnia Testnet)

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Deploy schemas
npm run deploy:schemas
```

---

**Happy building! 🎨✨**

