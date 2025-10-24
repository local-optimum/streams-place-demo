/**
 * Schema Deployment Script
 * 
 * This script registers the pixel data schema and event schema on the Somnia blockchain.
 * Run this once before starting the application.
 * 
 * Usage:
 *   npx tsx scripts/deploy-schemas.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getSDK } from '../lib/sdk';
import { 
  CANVAS_STATE_SCHEMA,
  PIXEL_EVENT_ID, 
  PIXEL_EVENT_SCHEMA,
  ZERO_BYTES32 
} from '../lib/constants';

async function main() {
  console.log('🚀 Starting schema deployment...\n');

  const sdk = getSDK();

  // Step 1: Compute Schema ID for canvas state (KV store pattern)
  console.log('📝 Computing canvas state schema ID...');
  const schemaId = await sdk.streams.computeSchemaId(CANVAS_STATE_SCHEMA);
  console.log(`✅ Schema ID: ${schemaId}\n`);
  console.log(`   Schema: ${CANVAS_STATE_SCHEMA}\n`);

  // Step 2: Register canvas state schema
  console.log('📤 Registering canvas state schema on-chain...');
  try {
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId!);
    
    if (isRegistered) {
      console.log('⚠️  Schema already registered!\n');
    } else {
      const schemaTx = await sdk.streams.registerDataSchemas([
        {
          schema: CANVAS_STATE_SCHEMA,
          parentSchemaId: ZERO_BYTES32,
        },
      ]);
      console.log(`✅ Canvas state schema registered! TX: ${schemaTx}\n`);
    }
  } catch (error: any) {
    if (error.message?.includes('already registered')) {
      console.log('⚠️  Schema already registered!\n');
    } else {
      throw error;
    }
  }

  // Step 3: Register Event Schema
  console.log('📤 Registering PixelPlaced event schema...');
  try {
    const eventTx = await sdk.streams.registerEventSchemas(
      [PIXEL_EVENT_ID],
      [PIXEL_EVENT_SCHEMA]
    );
    console.log(`✅ Event schema registered! TX: ${eventTx}\n`);
  } catch (error: any) {
    // EventSchemaAlreadyRegistered is expected and fine
    if (error.message?.includes('already registered') || 
        error.message?.includes('EventSchemaAlreadyRegistered')) {
      console.log('⚠️  Event schema already registered!\n');
    } else {
      throw error;
    }
  }

  // Step 4: Get publisher address
  const privateKey = process.env.PRIVATE_KEY?.trim();
  let formattedKey = privateKey;
  if (formattedKey && !formattedKey.startsWith('0x')) {
    formattedKey = `0x${formattedKey}`;
  }
  
  const { privateKeyToAccount } = await import('viem/accounts');
  const account = privateKeyToAccount(formattedKey as `0x${string}`);
  const publisherAddress = account.address;

  // Output configuration
  console.log('✅ Deployment complete!\n');
  console.log('📋 Add these to your .env.local file:\n');
  console.log(`NEXT_PUBLIC_PIXEL_SCHEMA_ID=${schemaId}`);
  console.log(`NEXT_PUBLIC_PUBLISHER_ADDRESS=${publisherAddress}\n`);
}

main()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

