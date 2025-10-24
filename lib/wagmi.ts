import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { somniaTestnet } from '@/lib/chains';

export const config = getDefaultConfig({
  appName: 'Streams Place',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://dream-rpc.somnia.network'),
  },
  ssr: true,
});

