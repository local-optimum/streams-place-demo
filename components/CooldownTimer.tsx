'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { COOLDOWN_SECONDS } from '@/lib/constants';
import { useCanvasStore } from '@/lib/store';

export function CooldownTimer() {
  const { address, isConnected } = useAccount();
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  
  const cooldownActive = useCanvasStore((state) => state.cooldownActive);
  const nextPlacementTime = useCanvasStore((state) => state.nextPlacementTime);
  const isPlacing = useCanvasStore((state) => state.isPlacing);
  const checkCooldown = useCanvasStore((state) => state.checkCooldown);

  // Update countdown timer
  useEffect(() => {
    if (!cooldownActive) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((nextPlacementTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      
      // Check if cooldown expired
      if (remaining === 0) {
        checkCooldown();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownActive, nextPlacementTime, checkCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canPlace = isConnected && !cooldownActive && !isPlacing;

  // Only show status when connected
  if (!isConnected) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="glass rounded-lg px-4 py-2.5">
        {isPlacing ? (
          <div className="text-blue-400 font-medium text-center flex items-center justify-center gap-2 text-sm">
            <span className="animate-spin">⏳</span> Placing pixel...
          </div>
        ) : cooldownActive ? (
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-xl tabular-nums">
              {formatTime(secondsRemaining)}
            </div>
            <div className="text-gray-400 text-xs">
              Cooldown active
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-400 font-bold flex items-center justify-center gap-2 text-sm">
              <span>✓</span> Ready to place!
            </div>
            <div className="text-gray-400 text-xs">
              Click canvas
            </div>
          </div>
        )}
      </div>
      
      {/* Wallet Address */}
      <div className="text-purple-300 text-xs font-mono text-center">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      
      {/* Progress Bar (when on cooldown) */}
      {cooldownActive && (
        <div className="w-full h-1.5 glass rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-100"
            style={{
              width: `${((COOLDOWN_SECONDS - secondsRemaining) / COOLDOWN_SECONDS) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

