import { type Hex } from 'viem';

// Canvas Configuration
export const CANVAS_WIDTH = parseInt(process.env.NEXT_PUBLIC_CANVAS_WIDTH || '100');
export const CANVAS_HEIGHT = parseInt(process.env.NEXT_PUBLIC_CANVAS_HEIGHT || '100');
export const COOLDOWN_SECONDS = parseInt(process.env.NEXT_PUBLIC_COOLDOWN_SECONDS || '2'); // 2 seconds for testing
export const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;

// 16-Color Palette (r/place inspired)
export const COLORS = [
  '#FFFFFF', // 0: White
  '#E4E4E4', // 1: Light Gray
  '#888888', // 2: Gray
  '#222222', // 3: Black
  '#FFA7D1', // 4: Pink
  '#E50000', // 5: Red
  '#E59500', // 6: Orange
  '#A06A42', // 7: Brown
  '#E5D900', // 8: Yellow
  '#94E044', // 9: Lime
  '#02BE01', // 10: Green
  '#00D3DD', // 11: Cyan
  '#0083C7', // 12: Blue
  '#0000EA', // 13: Dark Blue
  '#CF6EE4', // 14: Magenta
  '#820080', // 15: Purple
] as const;

export const COLOR_NAMES = [
  'White',
  'Light Gray',
  'Gray',
  'Black',
  'Pink',
  'Red',
  'Orange',
  'Brown',
  'Yellow',
  'Lime',
  'Green',
  'Cyan',
  'Blue',
  'Dark Blue',
  'Magenta',
  'Purple',
] as const;

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

// Schema Definitions (v5 - KV store pattern: store entire canvas state)
// Canvas state schema: stores ALL pixels as encoded bytes + last update timestamp
export const CANVAS_STATE_SCHEMA = 'bytes canvasData, uint64 lastUpdate';

// Individual pixel structure (for encoding into canvasData)
export const PIXEL_SCHEMA = 'uint32 x, uint32 y, uint8 color, uint64 timestamp, address placer';

// Fixed ID for the canvas state (KV store pattern - one value per schema+publisher)
export const CANVAS_STATE_ID = '0x63616e7661732d73746174652d7631000000000000000000000000000000000' as Hex; // "canvas-state-v1"

// Somnia Streams storage contract address (from SDK)
export const STREAMS_STORAGE_CONTRACT = '0x7A4c66a087D7Ecd7AAd61b0E2EF0F937b7797796' as const;

export const PIXEL_EVENT_ID = 'PixelPlaced';

export const PIXEL_EVENT_SCHEMA = {
  params: [
    { name: 'x', paramType: 'uint32', isIndexed: true },
    { name: 'y', paramType: 'uint32', isIndexed: true },
    { name: 'color', paramType: 'uint8', isIndexed: false },
  ],
  eventTopic: 'PixelPlaced(uint32 indexed x, uint32 indexed y, uint8 color)',
};

// Zero bytes for parent schema ID
export const ZERO_BYTES32: Hex = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Deployed Schema ID (set after deployment)
export const PIXEL_SCHEMA_ID = (process.env.NEXT_PUBLIC_PIXEL_SCHEMA_ID || '') as Hex;
export const PUBLISHER_ADDRESS = (process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS || '') as Hex;

