import { create } from 'zustand';
import type { Pixel } from '@/types/pixel';
import type { ColorIndex } from '@/lib/constants';
import type { Address } from 'viem';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface CanvasStore {
  // Canvas state
  pixels: Map<string, Pixel>; // key: "x,y" -> Pixel
  loading: boolean;
  error: string | null;

  // UI state
  selectedColor: ColorIndex;
  isPlacing: boolean;
  toasts: ToastMessage[];

  // Cooldown state
  cooldownActive: boolean;
  nextPlacementTime: number;
  
  // Actions
  setSelectedColor: (color: ColorIndex) => void;
  setPixel: (pixel: Pixel) => void;
  loadPixels: (pixels: Pixel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsPlacing: (isPlacing: boolean) => void;
  startCooldown: (nextPlacementTime: number) => void;
  checkCooldown: () => boolean;
  getPixelAt: (x: number, y: number) => Pixel | undefined;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Initial state
  pixels: new Map(),
  loading: false,
  error: null,
  selectedColor: 0,
  isPlacing: false,
  toasts: [],
  cooldownActive: false,
  nextPlacementTime: 0,

  // Actions
  setSelectedColor: (color) => set({ selectedColor: color }),

  setPixel: (pixel) =>
    set((state) => {
      const newPixels = new Map(state.pixels);
      const key = `${pixel.x},${pixel.y}`;
      newPixels.set(key, pixel);
      return { pixels: newPixels };
    }),

  loadPixels: (pixels) =>
    set((state) => {
      // Always merge - let blockchain state rebuild naturally
      // New pixels from events get added, existing pixels are preserved
      const pixelMap = new Map(state.pixels);
      
      pixels.forEach((pixel) => {
        const key = `${pixel.x},${pixel.y}`;
        const existing = pixelMap.get(key);
        
        // Only update if new pixel is more recent (or doesn't exist)
        if (!existing || pixel.timestamp > existing.timestamp) {
          pixelMap.set(key, pixel);
        }
      });
      
      console.log(`📊 Loaded ${pixels.length} new pixel(s), total: ${pixelMap.size} pixels`);
      return { pixels: pixelMap, loading: false };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsPlacing: (isPlacing) => set({ isPlacing }),

  startCooldown: (nextPlacementTime) =>
    set({
      cooldownActive: true,
      nextPlacementTime,
    }),

  checkCooldown: () => {
    const { cooldownActive, nextPlacementTime } = get();
    if (!cooldownActive) return false;

    if (Date.now() >= nextPlacementTime) {
      set({ cooldownActive: false, nextPlacementTime: 0 });
      return false;
    }
    return true;
  },

  getPixelAt: (x, y) => {
    const { pixels } = get();
    return pixels.get(`${x},${y}`);
  },

  showToast: (type, title, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, type, title, message };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

