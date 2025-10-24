import { NextRequest, NextResponse } from 'next/server';
import { getSDK, getWalletClient } from '@/lib/sdk';
import { PIXEL_SCHEMA_ID, PIXEL_EVENT_ID, CANVAS_STATE_ID, PUBLISHER_ADDRESS, COOLDOWN_MS } from '@/lib/constants';
import { 
  encodeCanvasState,
  decodeCanvasState,
  encodePixelEventTopics, 
  encodePixelEventData 
} from '@/lib/encoding';
import type { PixelPlacementRequest, PixelPlacementResponse, Pixel } from '@/types/pixel';

export async function POST(req: NextRequest) {
  try {
    const body: PixelPlacementRequest = await req.json();
    const { x, y, color, address } = body;

    console.log('📍 Placing pixel:', { x, y, color, address });

    // Validate inputs exist and are numbers
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      return NextResponse.json(
        { success: false, error: `Invalid coordinates: x=${x}, y=${y}` },
        { status: 400 }
      );
    }

    if (x < 0 || x >= 100 || y < 0 || y >= 100) {
      return NextResponse.json(
        { success: false, error: 'Coordinates out of bounds' },
        { status: 400 }
      );
    }

    if (typeof color !== 'number' || isNaN(color) || color < 0 || color > 15) {
      return NextResponse.json(
        { success: false, error: 'Invalid color index' },
        { status: 400 }
      );
    }

    // Check environment variables (PIXEL_SCHEMA_ID is a const from constants.ts)
    if (!PIXEL_SCHEMA_ID) {
      console.error('❌ PIXEL_SCHEMA_ID not set in environment');
      return NextResponse.json(
        { success: false, error: 'Schema not configured. Please run deploy:schemas and set NEXT_PUBLIC_PIXEL_SCHEMA_ID in .env.local' },
        { status: 500 }
      );
    }

    console.log('✅ Schema ID:', PIXEL_SCHEMA_ID);

    const timestamp = Math.floor(Date.now() / 1000);

    // Get SDK instance
    console.log('🔧 Getting SDK instance...');
    const sdk = getSDK();
    const serverWallet = getWalletClient();
    const serverAddress = serverWallet.account.address;
    
    console.log('🔑 Server wallet address:', serverAddress);
    console.log('🔑 PUBLISHER_ADDRESS from env:', PUBLISHER_ADDRESS);
    console.log('🔑 Addresses match?', serverAddress.toLowerCase() === PUBLISHER_ADDRESS.toLowerCase());
    
    // STEP 1: Read current canvas state (KV store pattern)
    console.log('📖 Reading current canvas state from server address...');
    let currentPixels: Pixel[] = [];
    
    try {
      // CRITICAL: Read from server's own address (where we write)
      const currentData = await sdk.streams.getAllPublisherDataForSchema(PIXEL_SCHEMA_ID, serverAddress);
      if (currentData && currentData.length > 0) {
        currentPixels = decodeCanvasState(currentData[0]);
        console.log(`✅ Found ${currentPixels.length} existing pixels on global canvas`);
      } else {
        console.log('ℹ️ Canvas is empty (first pixel!)');
      }
    } catch (error) {
      console.log('ℹ️ No existing canvas state, starting fresh', error);
    }
    
    // STEP 2: Modify - add or update pixel
    const newPixel: Pixel = {
      x,
      y,
      color,
      timestamp,
      placer: address,
    };
    
    // Remove any existing pixel at this location (replace)
    const filteredPixels = currentPixels.filter(p => !(p.x === x && p.y === y));
    const updatedPixels = [...filteredPixels, newPixel];
    
    console.log(`📝 Updated canvas: ${filteredPixels.length} kept + 1 new = ${updatedPixels.length} total`);
    
    // STEP 3: Write - encode and store entire canvas state
    const encodedCanvasState = encodeCanvasState(updatedPixels);
    console.log('📦 Encoded canvas state:', encodedCanvasState.slice(0, 66) + '...');
    
    // STEP 3b: Write + Emit using setAndEmitEvents (atomic operation)
    // This is the Somnia reactivity pattern for real-time updates!
    console.log('📤 Writing canvas state + emitting event (atomic)...');
    
    const dataStreams = [{
      id: CANVAS_STATE_ID,  // Fixed ID for canvas state (KV pattern)
      schemaId: PIXEL_SCHEMA_ID,
      data: encodedCanvasState,
    }];
    
    const eventStreams = [{
      id: PIXEL_EVENT_ID,  // Registered event schema
      argumentTopics: encodePixelEventTopics(x, y),
      data: encodePixelEventData(color),
    }];
    
    const tx = await sdk.streams.setAndEmitEvents(dataStreams, eventStreams);

    console.log('✅ Transaction successful (state + event):', tx);
    console.log(`📊 Canvas now has ${updatedPixels.length} pixels`);
    console.log(`🔔 Event emitted for real-time subscribers`);

    console.log('⏱️ COOLDOWN_MS value:', COOLDOWN_MS);
    console.log('⏱️ Next placement time:', new Date(Date.now() + COOLDOWN_MS).toISOString());
    
    const response: PixelPlacementResponse = {
      success: true,
      tx: tx as string,
      dataId: CANVAS_STATE_ID,  // Always the same ID in KV pattern
      nextPlacementTime: Date.now() + COOLDOWN_MS, // Use configured cooldown
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Error placing pixel:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error message
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to place pixel',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

