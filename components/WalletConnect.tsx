'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletConnect() {
  return (
    <div className="w-full [&>div]:w-full [&_button]:w-full">
      <ConnectButton 
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}

