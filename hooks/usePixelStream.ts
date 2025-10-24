'use client';

import { useEffect, useRef } from 'react';
import { encodeFunctionData, decodeAbiParameters } from 'viem';
import type { Pixel } from '@/types/pixel';
import { PIXEL_EVENT_ID, PIXEL_SCHEMA_ID, PUBLISHER_ADDRESS, STREAMS_STORAGE_CONTRACT } from '@/lib/constants';
import { decodeCanvasState } from '@/lib/encoding';

/**
 * Hook for real-time canvas updates using Somnia Streams reactivity
 * 
 * COMPLETELY CLIENT-SIDE with ZERO extra round-trips! 🚀
 * 
 * - Subscribes to PixelPlaced events with ethCalls
 * - Canvas state is automatically included in event payload
 * - No separate blockchain fetch needed after event fires!
 * - Falls back to manual fetch if ethCalls fail
 * - Falls back to polling if WebSocket/reactivity is unavailable
 *
 * @param onCanvasUpdate - Callback when canvas state changes
 * @param pollInterval - Fallback polling interval in ms (default: 5000ms)
 */
export function usePixelStream(
  onCanvasUpdate: (pixels: Pixel[]) => void,
  pollInterval: number = 5000
) {
  const subscriptionRef = useRef<{ subscriptionId?: string; unsubscribe: () => void } | null>(null);
  const onCanvasUpdateRef = useRef(onCanvasUpdate);
  
  // Keep callback ref updated (but don't trigger re-subscription)
  useEffect(() => {
    onCanvasUpdateRef.current = onCanvasUpdate;
  }, [onCanvasUpdate]);
  
  useEffect(() => {
    let isMounted = true;
    let pollIntervalId: NodeJS.Timeout | null = null;

    // Fetch canvas directly from blockchain (serverless!)
    async function fetchCanvas() {
      if (!isMounted) return;
      
      console.log('🔄 [Initial Fetch] Starting canvas fetch from blockchain...');
      
      try {
        // Dynamically import client SDK
        const { getClientSDK } = await import('@/lib/client-sdk');
        const sdk = getClientSDK();
        
        // Retry logic - blockchain nodes may be inconsistent
        let bestData = null;
        let bestPixelCount = 0;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`   Attempt ${attempt}/3: Querying blockchain...`);
            const data = await sdk.streams.getAllPublisherDataForSchema(
              PIXEL_SCHEMA_ID,
              PUBLISHER_ADDRESS
            );
            
            if (data && data.length > 0) {
              const pixels = decodeCanvasState(data[0]);
              console.log(`   Attempt ${attempt}: Found ${pixels.length} pixels`);
              
              if (pixels.length > bestPixelCount) {
                bestPixelCount = pixels.length;
                bestData = pixels;
              }
              
              // Early exit if we got good data on attempt 2+
              if (attempt >= 2 && bestPixelCount > 0) break;
            } else {
              console.log(`   Attempt ${attempt}: No data returned`);
            }
          } catch (error: any) {
            console.log(`⚠️ Blockchain read attempt ${attempt}/3 failed:`, error.message);
          }
          
          // Small delay between attempts
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (bestData && bestData.length > 0) {
          console.log(`✅ [Initial Fetch] Successfully fetched ${bestData.length} pixels from blockchain`);
          onCanvasUpdateRef.current(bestData);
        } else {
          console.log('⚠️ [Initial Fetch] No pixels found after 3 retries - canvas appears empty');
        }
      } catch (error) {
        console.error('❌ [Initial Fetch] Error fetching canvas from blockchain:', error);
      }
    }

    // Try to set up real-time reactivity subscription
    async function setupReactivity() {
      try {
        console.log('🔌 Setting up Somnia Streams reactivity subscription...');
        
        // Dynamically import client SDK (browser-only)
        const { getClientSDK } = await import('@/lib/client-sdk');
        const sdk = getClientSDK();
        
        console.log(`📡 Subscribing to "${PIXEL_EVENT_ID}" events with ethCalls...`);
        
        // Encode contract call to automatically fetch canvas state with the event
        const canvasStateCall = encodeFunctionData({
          abi: [{
            inputs: [
              { name: 'schemaId', type: 'bytes32' },
              { name: 'publisher', type: 'address' }
            ],
            name: 'getAllPublisherDataForSchema',
            outputs: [{ name: '', type: 'bytes[]' }],
            stateMutability: 'view',
            type: 'function'
          }],
          functionName: 'getAllPublisherDataForSchema',
          args: [PIXEL_SCHEMA_ID, PUBLISHER_ADDRESS]
        });
        
        const subscription = await sdk.streams.subscribe({
          somniaStreamsEventId: PIXEL_EVENT_ID,
          ethCalls: [{
            to: STREAMS_STORAGE_CONTRACT,
            data: canvasStateCall
          }],
          onData: (data: any) => {
            if (isMounted) {
              console.log('🔔 Pixel event received with ethCall data');
              
              try {
                // Extract ethCall result from simulationResults
                const simulationResults = data.result?.simulationResults;
                
                if (simulationResults && simulationResults.length > 0) {
                  const rawResult = simulationResults[0];
                  console.log('📦 Raw ethCall result (first 100 chars):', rawResult.slice(0, 100));
                  
                  // Step 1: Decode the bytes[] from contract call
                  const [bytesArray] = decodeAbiParameters(
                    [{ name: 'data', type: 'bytes[]' }],
                    rawResult
                  ) as [readonly `0x${string}`[]];
                  
                  console.log(`🔓 Got ${bytesArray.length} bytes[] elements`);
                  
                  if (bytesArray.length > 0) {
                    // Step 2: Decode the schema (bytes canvasData, uint64 lastUpdate)
                    const schemaData = bytesArray[0];
                    const [canvasDataBytes, lastUpdate] = decodeAbiParameters(
                      [
                        { name: 'canvasData', type: 'bytes' },
                        { name: 'lastUpdate', type: 'uint64' }
                      ],
                      schemaData
                    );
                    
                    console.log(`📝 Canvas data: ${canvasDataBytes.slice(0, 50)}... (lastUpdate: ${lastUpdate})`);
                    
                    // Step 3: Decode the pixel array from canvasData
                    const [pixelsRaw] = decodeAbiParameters(
                      [{
                        name: 'pixels',
                        type: 'tuple[]',
                        components: [
                          { name: 'x', type: 'uint32' },
                          { name: 'y', type: 'uint32' },
                          { name: 'color', type: 'uint8' },
                          { name: 'timestamp', type: 'uint64' },
                          { name: 'placer', type: 'address' }
                        ]
                      }],
                      canvasDataBytes
                    );
                    
                    const pixels: Pixel[] = (pixelsRaw as any[]).map((p: any) => ({
                      x: Number(p.x),
                      y: Number(p.y),
                      color: Number(p.color) as Pixel['color'],
                      timestamp: Number(p.timestamp),
                      placer: p.placer,
                    }));
                    
                    console.log(`✅ Got ${pixels.length} pixels from ethCall (ZERO round-trips!)`);
                    onCanvasUpdateRef.current(pixels);
                    return; // Success!
                  }
                }
                
                console.log('⚠️ No ethCall results, falling back to manual fetch');
                fetchCanvas();
              } catch (error) {
                console.error('❌ Error decoding ethCall result:', error);
                // Fallback to manual fetch
                fetchCanvas();
              }
            }
          },
          onError: (error: Error) => {
            console.error('❌ Subscription error:', error);
          },
          onlyPushChanges: false,
        });
        
        if (subscription) {
          subscriptionRef.current = subscription;
          console.log('✅ Successfully subscribed to pixel events!', subscription.subscriptionId);
        } else {
          console.warn('⚠️ Subscription returned undefined');
          startPolling();
        }
        
        // Initial fetch
        await fetchCanvas();
      } catch (error: any) {
        console.warn('⚠️ Reactivity setup failed:', error.message);
        console.log('⚠️ Falling back to polling...');
        startPolling();
      }
    }

    // Polling fallback
    function startPolling() {
      console.log(`⏱️ Polling every ${pollInterval / 1000}s for canvas updates`);
      
      // Initial fetch
      fetchCanvas();
      
      pollIntervalId = setInterval(() => {
        fetchCanvas();
      }, pollInterval);
    }

    // Start setup
    setupReactivity();

    // Cleanup
    return () => {
      isMounted = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log('🔌 Unsubscribed from Somnia Streams');
      }
      
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        console.log('🔌 Stopped canvas polling');
      }
    };
  }, [pollInterval]); // Only re-subscribe if pollInterval changes
}

