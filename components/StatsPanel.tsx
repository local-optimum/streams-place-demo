'use client';

import { useState, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import { COLORS } from '@/lib/constants';
import { WalletConnect } from '@/components/WalletConnect';

export function StatsPanel() {
  const pixels = useCanvasStore((state) => state.pixels);
  const [stats, setStats] = useState({
    totalPixels: 0,
    uniquePlacers: 0,
    mostActiveColor: 0,
  });

  // Calculate stats from pixel data
  useEffect(() => {
    const pixelArray = Array.from(pixels.values());
    const uniquePlacersSet = new Set(pixelArray.map(p => p.placer));
    
    // Count color usage
    const colorCounts = new Map<number, number>();
    pixelArray.forEach(pixel => {
      colorCounts.set(pixel.color, (colorCounts.get(pixel.color) || 0) + 1);
    });
    
    // Find most used color
    let mostActive = 0;
    let maxCount = 0;
    colorCounts.forEach((count, color) => {
      if (count > maxCount) {
        maxCount = count;
        mostActive = color;
      }
    });

    setStats({
      totalPixels: pixelArray.length,
      uniquePlacers: uniquePlacersSet.size,
      mostActiveColor: mostActive,
    });
  }, [pixels]);

  // Get recent placements (last 6)
  const recentPlacements = Array.from(pixels.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6);

  return (
    <div className="glass-strong rounded-xl p-3 shadow-2xl h-full flex flex-col">
      {/* Wallet Connection */}
      <div className="mb-3 pb-3 border-b border-gray-700/30">
        <WalletConnect />
      </div>
      
      {/* Stats */}
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live Statistics
        </h2>
        
        <div className="space-y-2 mb-3">
          <StatItem
            label="Total Pixels"
            value={stats.totalPixels.toLocaleString()}
          />
          <StatItem
            label="Unique Placers"
            value={stats.uniquePlacers.toLocaleString()}
          />
          <div className="flex items-center justify-between p-2.5 glass rounded-lg">
            <span className="text-gray-300 text-sm font-medium">Popular Color</span>
            <div 
              className="w-6 h-6 rounded-md border-2 border-purple-400/50 shadow-sm"
              style={{ backgroundColor: COLORS[stats.mostActiveColor] }}
              title={COLORS[stats.mostActiveColor]}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-white mb-2">Recent Activity</h3>
          <div className="space-y-1.5 text-xs overflow-y-auto flex-1">
            {recentPlacements.length > 0 ? (
              recentPlacements.map((pixel, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300 p-2 glass rounded-md">
                  <div
                    className="w-3.5 h-3.5 rounded border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: COLORS[pixel.color] }}
                  />
                  <span className="text-gray-400 font-mono text-xs">
                    ({pixel.x}, {pixel.y})
                  </span>
                  <span className="text-gray-500 text-xs truncate ml-auto">
                    {typeof pixel.placer === 'string' 
                      ? `${pixel.placer.slice(0, 6)}...${pixel.placer.slice(-4)}`
                      : '0x...'
                    }
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-3 text-xs">No placements yet</p>
            )}
          </div>
        </div>
      </div>

      {/* How to Play - At bottom */}
      <div className="mt-3 pt-3 border-t border-gray-700/30">
        <h3 className="text-xs font-semibold text-white mb-2">How to Play</h3>
        <ol className="space-y-1 text-xs text-gray-400">
          {[
            'Connect your wallet',
            'Choose a color',
            'Click a pixel on canvas',
            'Collaborate & create!',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[8px] font-bold text-white mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 glass rounded-lg">
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      <span className="text-base font-bold gradient-text">{value}</span>
    </div>
  );
}

