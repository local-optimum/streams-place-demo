/**
 * Environment Check Script
 * Verifies all required environment variables are set correctly
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Checking Environment Configuration...\n');

const checks = [
  {
    name: 'RPC_URL',
    value: process.env.RPC_URL,
    required: true,
    expected: 'https://dream-rpc.somnia.network'
  },
  {
    name: 'WS_RPC_URL',
    value: process.env.WS_RPC_URL,
    required: false,
    expected: 'wss://dream-rpc.somnia.network'
  },
  {
    name: 'PRIVATE_KEY',
    value: process.env.PRIVATE_KEY,
    required: true,
    sensitive: true,
    validator: (val: string) => {
      if (!val) return 'Not set';
      if (val === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return 'Still using placeholder value';
      }
      if (!val.startsWith('0x')) return 'Missing 0x prefix';
      if (val.length !== 66) return `Wrong length: ${val.length} (expected 66)`;
      if (!/^0x[0-9a-fA-F]{64}$/.test(val)) return 'Invalid format';
      return null;
    }
  },
  {
    name: 'NEXT_PUBLIC_PIXEL_SCHEMA_ID',
    value: process.env.NEXT_PUBLIC_PIXEL_SCHEMA_ID,
    required: true,
    expected: '0x... (66 characters)'
  },
  {
    name: 'NEXT_PUBLIC_PUBLISHER_ADDRESS',
    value: process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS,
    required: true,
    expected: '0x... (42 characters)'
  },
];

let hasErrors = false;

checks.forEach((check) => {
  const value = check.value;
  const display = check.sensitive && value 
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : value || '❌ NOT SET';

  console.log(`\n${check.name}:`);
  console.log(`  Value: ${display}`);
  
  if (!value && check.required) {
    console.log(`  ❌ ERROR: Required but not set`);
    hasErrors = true;
  } else if (value && check.expected) {
    console.log(`  Expected: ${check.expected}`);
  }

  if (check.validator && value) {
    const error = check.validator(value);
    if (error) {
      console.log(`  ❌ ERROR: ${error}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ Valid format`);
    }
  } else if (value && check.required) {
    console.log(`  ✅ Set`);
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ CONFIGURATION ERRORS FOUND!\n');
  console.log('Please fix the errors above and ensure:');
  console.log('1. You have run: npm run deploy:schemas');
  console.log('2. You have copied the output to .env.local');
  console.log('3. Your PRIVATE_KEY is valid (not the placeholder)');
  console.log('\nFor help, see: QUICK_START.md\n');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are correctly configured!\n');
  console.log('You should be ready to place pixels. If you still have issues:');
  console.log('1. Restart your dev server (npm run dev)');
  console.log('2. Check browser console for detailed errors');
  console.log('3. Check terminal logs for API errors\n');
  process.exit(0);
}

