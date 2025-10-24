'use client';

import { useRef, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COLOR_NAMES } from '@/lib/constants';
import { useCanvasStore } from '@/lib/store';
import { usePixelStream } from '@/hooks/usePixelStream';
import type { Pixel } from '@/types/pixel';

interface TooltipData {
  x: number;
  y: number;
  pixel: Pixel | null;
  mouseX: number;
  mouseY: number;
}

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const selectedColor = useCanvasStore((state) => state.selectedColor);
  const pixels = useCanvasStore((state) => state.pixels);
  const loading = useCanvasStore((state) => state.loading);
  const isPlacing = useCanvasStore((state) => state.isPlacing);
  const loadPixels = useCanvasStore((state) => state.loadPixels);
  const setLoading = useCanvasStore((state) => state.setLoading);
  const setError = useCanvasStore((state) => state.setError);
  const setPixel = useCanvasStore((state) => state.setPixel);
  const checkCooldown = useCanvasStore((state) => state.checkCooldown);

  // Real-time canvas updates via Somnia Streams + direct blockchain reads
  // This hook handles everything: initial load, events, and fallback polling
  usePixelStream((pixels) => {
    if (pixels && pixels.length > 0) {
      loadPixels(pixels);
      setLoading(false); // Initial load complete
    }
  }, 5000); // Poll every 5 seconds as fallback

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set white background
    ctx.fillStyle = COLORS[0];
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw all pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = COLORS[pixel.color];
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    });

    // Draw hover preview
    if (hoveredPixel && isConnected && !isPlacing) {
      ctx.fillStyle = COLORS[selectedColor];
      ctx.globalAlpha = 0.5;
      ctx.fillRect(hoveredPixel.x, hoveredPixel.y, 1, 1);
      ctx.globalAlpha = 1.0;
    }

    // Draw grid lines (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.02;
    for (let i = 0; i <= CANVAS_WIDTH; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }
  }, [pixels, hoveredPixel, selectedColor, isConnected, isPlacing]);

  const showToast = useCanvasStore((state) => state.showToast);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isConnected || !address) {
      showToast('warning', 'Wallet Required', 'Please connect your wallet to place pixels');
      return;
    }

    if (isPlacing) {
      return; // Already placing a pixel
    }

    if (checkCooldown()) {
      const remaining = Math.ceil((useCanvasStore.getState().nextPlacementTime - Date.now()) / 1000);
      showToast('warning', 'Cooldown Active', `Please wait ${remaining} seconds before placing another pixel`);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate pixel coordinates based on canvas dimensions
    // rect.width and rect.height are the actual displayed size
    const x = Math.floor((e.clientX - rect.left) * (CANVAS_WIDTH / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height));

    // Validate coordinates
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
      return;
    }

    try {
      useCanvasStore.setState({ isPlacing: true });

      const response = await fetch('/api/place-pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x,
          y,
          color: selectedColor,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('API Error Response:', data);
        throw new Error(data.error || 'Failed to place pixel');
      }

      // Update local state immediately (optimistic update)
      const newPixel: Pixel = {
        x,
        y,
        color: selectedColor,
        timestamp: Math.floor(Date.now() / 1000),
        placer: address,
      };
      useCanvasStore.getState().setPixel(newPixel);

      // Start cooldown
      if (data.nextPlacementTime) {
        useCanvasStore.getState().startCooldown(data.nextPlacementTime);
      }

      console.log('✅ Pixel placed successfully!', data);
      showToast('success', 'Pixel Placed!', `Successfully placed at (${x}, ${y})`);
    } catch (error) {
      console.error('Error placing pixel:', error);
      showToast('error', 'Placement Failed', error instanceof Error ? error.message : 'Failed to place pixel');
    } finally {
      useCanvasStore.setState({ isPlacing: false });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      setHoveredPixel(null);
      setTooltip(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Get mouse position relative to viewport
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const x = Math.floor((clientX - rect.left) / (rect.width / CANVAS_WIDTH));
    const y = Math.floor((clientY - rect.top) / (rect.height / CANVAS_HEIGHT));

    if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
      setHoveredPixel({ x, y });
      
      // Get pixel at this position
      const pixelKey = `${x},${y}`;
      const pixel = pixels.get(pixelKey) || null;
      
      // Calculate position relative to container for absolute positioning
      const relativeX = clientX - containerRect.left;
      const relativeY = clientY - containerRect.top;
      
      setTooltip({
        x,
        y,
        pixel,
        mouseX: relativeX,
        mouseY: relativeY,
      });
    } else {
      setHoveredPixel(null);
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPixel(null);
    setTooltip(null);
  };

  return (
    <div className="flex flex-col gap-6" ref={containerRef}>
      {/* Canvas Container with Somnia Branding */}
      <div className="relative flex justify-center">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center glass-strong z-10 rounded-xl">
            <div className="text-white text-lg font-medium">Loading canvas...</div>
          </div>
        )}
        
        {/* Canvas with gradient border */}
        <div className="p-1 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 shadow-2xl max-w-full">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={(e) => {
              // Convert touch event to mouse-like event for consistency
              if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const mouseEvent = {
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  currentTarget: e.currentTarget,
                  preventDefault: () => {},
                  stopPropagation: () => {},
                } as React.MouseEvent<HTMLCanvasElement>;
                handleCanvasClick(mouseEvent);
              }
            }}
            className={`rounded-lg max-w-full h-auto ${
              isConnected && !isPlacing ? 'cursor-crosshair' : 'cursor-not-allowed'
            }`}
            style={{
              width: '600px',
              maxWidth: '100%',
              height: 'auto',
              aspectRatio: '1',
              imageRendering: 'pixelated',
              display: 'block',
            }}
          />
        </div>

        {/* Cursor-Following Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 glass-strong rounded-lg px-3 py-2 shadow-xl pointer-events-none whitespace-nowrap"
            style={{
              left: `${tooltip.mouseX + 16}px`,
              top: `${tooltip.mouseY + 8}px`,
            }}
          >
            <div className="text-sm space-y-1.5">
              {/* Coordinates */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Position:</span>
                <span className="text-white font-mono text-xs font-semibold">
                  ({tooltip.x}, {tooltip.y})
                </span>
              </div>
              
              {tooltip.pixel ? (
                <>
                  {/* Color with swatch and name */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-white/30 shadow-sm"
                      style={{ backgroundColor: COLORS[tooltip.pixel.color] }}
                    />
                    <span className="text-white font-medium text-xs">
                      {COLOR_NAMES[tooltip.pixel.color]}
                    </span>
                  </div>
                  
                  {/* Placer address */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs">By:</span>
                    <span className="text-purple-300 font-mono text-xs">
                      {tooltip.pixel.placer.slice(0, 6)}...{tooltip.pixel.placer.slice(-4)}
                    </span>
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-gray-400 text-xs">
                    {new Date(tooltip.pixel.timestamp * 1000).toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-xs italic">Empty pixel - click to place!</div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

