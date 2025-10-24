import { type Address, type Hex, encodePacked, pad, toHex, encodeAbiParameters, decodeAbiParameters, parseAbiParameters } from 'viem';
import { SchemaEncoder } from '@somnia-chain/streams';
import type { Pixel } from '@/types/pixel';
import { CANVAS_STATE_SCHEMA } from '@/lib/constants';

/**
 * Encodes entire canvas state (array of pixels) using SDK's SchemaEncoder
 * KV Store Pattern: Stores ALL pixels in one value
 * 
 * Schema: bytes canvasData, uint64 lastUpdate
 */
export function encodeCanvasState(pixels: Pixel[]): Hex {
  const encoder = new SchemaEncoder(CANVAS_STATE_SCHEMA);
  
  // Encode all pixels as an array
  const pixelsEncoded = encodeAbiParameters(
    parseAbiParameters('(uint32 x, uint32 y, uint8 color, uint64 timestamp, address placer)[]'),
    [pixels.map(p => ({
      x: p.x,
      y: p.y,
      color: p.color,
      timestamp: BigInt(p.timestamp),
      placer: p.placer
    }))]
  );
  
  return encoder.encodeData([
    { name: 'canvasData', value: pixelsEncoded, type: 'bytes' },
    { name: 'lastUpdate', value: Date.now().toString(), type: 'uint64' },
  ]);
}

/**
 * Decodes canvas state back into array of pixels
 */
export function decodeCanvasState(data: any): Pixel[] {
  try {
    // Extract canvasData bytes from the nested structure
    const getValue = (field: any): any => {
      if (!field || typeof field !== 'object') return field;
      if ('value' in field) {
        const val = field.value;
        if (val && typeof val === 'object' && 'value' in val) {
          return val.value;
        }
        return val;
      }
      return field;
    };
    
    const canvasDataField = Array.isArray(data) ? data[0] : data;
    const canvasDataBytes = getValue(canvasDataField) as Hex;
    
    if (!canvasDataBytes || canvasDataBytes === '0x') {
      return []; // Empty canvas
    }
    
    // Decode the pixel array
    const [pixelsRaw] = decodeAbiParameters(
      parseAbiParameters('(uint32 x, uint32 y, uint8 color, uint64 timestamp, address placer)[]'),
      canvasDataBytes
    );
    
    return pixelsRaw.map((p: any) => ({
      x: Number(p.x),
      y: Number(p.y),
      color: Number(p.color) as Pixel['color'],
      timestamp: Number(p.timestamp),
      placer: p.placer as Address,
    }));
  } catch (error) {
    console.error('Error decoding canvas state:', error);
    return [];
  }
}

/**
 * Encodes event argument topics for PixelPlaced event
 * Note: Indexed event parameters must be padded to bytes32
 */
export function encodePixelEventTopics(x: number, y: number): Hex[] {
  return [
    pad(toHex(x), { size: 32 }),
    pad(toHex(y), { size: 32 }),
  ];
}

/**
 * Encodes event data (color)
 * Non-indexed parameters are encoded normally
 */
export function encodePixelEventData(color: number): Hex {
  return encodePacked(['uint8'], [color]);
}

