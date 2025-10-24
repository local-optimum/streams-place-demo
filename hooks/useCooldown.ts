'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { CooldownStatus } from '@/types/pixel';

/**
 * Hook to manage cooldown state for pixel placement
 */
export function useCooldown() {
  const { address } = useAccount();
  const [cooldownStatus, setCooldownStatus] = useState<CooldownStatus>({
    canPlace: true,
    nextPlacementTime: 0,
    secondsRemaining: 0,
  });

  useEffect(() => {
    if (!address) return;

    async function checkCooldown() {
      try {
        const response = await fetch(`/api/cooldown/${address}`);
        if (response.ok) {
          const data: CooldownStatus = await response.json();
          setCooldownStatus(data);
        }
      } catch (error) {
        console.error('Error checking cooldown:', error);
      }
    }

    // Check immediately
    checkCooldown();

    // Poll every second if on cooldown
    const interval = setInterval(() => {
      if (!cooldownStatus.canPlace) {
        checkCooldown();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [address, cooldownStatus.canPlace]);

  const startCooldown = (nextPlacementTime: number) => {
    setCooldownStatus({
      canPlace: false,
      nextPlacementTime,
      secondsRemaining: Math.floor((nextPlacementTime - Date.now()) / 1000),
    });
  };

  return {
    ...cooldownStatus,
    startCooldown,
  };
}

