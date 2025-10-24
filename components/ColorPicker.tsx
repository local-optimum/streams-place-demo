'use client';

import { COLORS, type ColorIndex } from '@/lib/constants';
import { useCanvasStore } from '@/lib/store';

export function ColorPicker() {
  const selectedColor = useCanvasStore((state) => state.selectedColor);
  const setSelectedColor = useCanvasStore((state) => state.setSelectedColor);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-full">
      {COLORS.map((color, index) => (
        <button
          key={index}
          onClick={() => setSelectedColor(index as ColorIndex)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-all duration-200 touch-manipulation ${
            selectedColor === index
              ? 'border-2 border-purple-400 scale-110 sm:scale-125 shadow-[0_0_15px_rgba(139,92,246,0.8),0_0_30px_rgba(139,92,246,0.4)] ring-2 ring-purple-500/50'
              : 'border-2 border-gray-600/50 hover:border-purple-400/70 active:scale-105 sm:hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]'
          }`}
          style={{ 
            backgroundColor: color,
            imageRendering: 'pixelated',
          }}
          title={`Color ${index}: ${color}`}
          aria-label={`Select color ${index}`}
        />
      ))}
    </div>
  );
}

