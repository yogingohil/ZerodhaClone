#!/usr/bin/env node

/**
 * ===================================
 * Dashboard API Diagnostic Tool
 * ===================================
 * 
 * This script tests the API endpoints and shows the actual
 * response structure to help fix the data mismatch issue.
 * 
 * Run from project root: node api-diagnostic.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3002';
const SYMBOLS = ['INFY', 'BHARTIARTL', 'HDFCBANK', 'TCS'];
const EXCHANGES = ['NSE', 'BSE'];

async function testAllHoldingsEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: /allHoldings Endpoint');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${API_BASE}/allHoldings`);
    console.log('✓ Status:', response.status);
    console.log('✓ Response received, Holdings count:', response.data.length);
    console.log('\n📋 First holding structure:');
    console.log(JSON.stringify(response.data[0], null, 2));
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

async function testStockAPIEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: /api/stocks/:symbol Endpoint');
  console.log('='.repeat(60));
  
  for (const symbol of SYMBOLS.slice(0, 1)) {  // Test first symbol
    for (const exchange of EXCHANGES) {
      console.log(`\n🔍 Testing: ${symbol} on ${exchange}`);
      console.log('-'.repeat(40));
      
      try {
        const response = await axios.get(
          `${API_BASE}/api/stocks/${symbol}?exchange=${exchange}`,
          { timeout: 5000 }
        );
        
        console.log(`✓ Status: ${response.status}`);
        console.log('✓ Response received');
        console.log('\n📊 Response Structure:');
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
        
        // Check for expected properties
        console.log('\n🔎 Property Analysis:');
        console.log(`  - Has 'priceInfo'?: ${!!response.data.priceInfo}`);
        console.log(`  - Has 'info'?: ${!!response.data.info}`);
        console.log(`  - Has 'data'?: ${!!response.data.data}`);
        console.log(`  - Has 'quote'?: ${!!response.data.quote}`);
        console.log(`  - Has 'lastPrice'?: ${!!response.data.lastPrice}`);
        console.log(`  - Has 'previousClose'?: ${!!response.data.previousClose}`);
        
        // Find where price info actually is
        const findPrice = (obj, depth = 0) => {
          if (depth > 3) return null;
          if (obj?.lastPrice !== undefined) return `found at obj.lastPrice`;
          if (obj?.priceInfo?.lastPrice !== undefined) return `found at obj.priceInfo.lastPrice`;
          if (obj?.info?.lastPrice !== undefined) return `found at obj.info.lastPrice`;
          if (obj?.data?.lastPrice !== undefined) return `found at obj.data.lastPrice`;
          if (obj?.quote?.lastPrice !== undefined) return `found at obj.quote.lastPrice`;
          return 'NOT FOUND';
        };
        
        console.log(`\n💡 LastPrice location: ${findPrice(response.data)}`);
        
        break;  // Only test one exchange per symbol
        
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
        if (error.response?.status === 500) {
          console.error('  → Backend error. Check if symbol exists or API is available');
        }
      }
    }
  }
}

async function showRecommendation() {
  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMMENDATIONS');
  console.log('='.repeat(60));
  console.log(`
1. Check the response structure above
2. If properties are nested, use dot notation:
   - response.data.priceInfo.lastPrice (expected)
   - response.data.info.lastPrice (actual?)
   - response.data.lastPrice (actual?)

3. Update Holdings.js Line 34-42:
   Replace: if (response.data && response.data.priceInfo)
   With:    if (response.data && (response.data.priceInfo || response.data.lastPrice))

4. Update property access based on actual response format
  `);
}

(async () => {
  console.log('\n🚀 Dashboard API Diagnostic Started');
  console.log(`Testing against: ${API_BASE}\n`);
  
  await testAllHoldingsEndpoint();
  await testStockAPIEndpoint();
  await showRecommendation();
  
  console.log('\n✓ Diagnostic complete\n');
  process.exit(0);
})().catch(err => {
  console.error('\n✗ Fatal error:', err.message);
  process.exit(1);
});
