import type { Address } from 'viem';
import type { ColorIndex } from '@/lib/constants';

export interface Pixel {
  x: number;
  y: number;
  color: ColorIndex;
  timestamp: number;
  placer: Address;
}

export interface PixelPlacementRequest {
  x: number;
  y: number;
  color: ColorIndex;
  address: Address;
}

export interface PixelPlacementResponse {
  success: boolean;
  tx?: string;
  dataId?: string;
  error?: string;
  nextPlacementTime?: number;
}

export interface CanvasState {
  pixels: Pixel[];
  totalPixels: number;
}

export interface CooldownStatus {
  canPlace: boolean;
  nextPlacementTime: number;
  secondsRemaining: number;
}

export interface CanvasStats {
  totalPixels: number;
  uniquePlacers: number;
  mostActiveColor: ColorIndex;
  lastPlacement: number;
}

