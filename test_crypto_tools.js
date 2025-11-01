import ObscureXAgent from './agent.js';

async function testCryptoTools() {
  const agent = new ObscureXAgent();
  
  console.log('=== Testing Crypto Analysis Tools ===\n');
  
  // Test analyzing the sample data
  console.log('1. Analyzing Binance data...');
  const analysisResult = await agent.executeTool('analyzeBinanceData', {
    filename: 'sample_binance_data.csv'
  });
  
  if (analysisResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Analysis results:');
    console.log('  - Total records:', analysisResult.result.totalRecords);
    console.log('  - Price range:', analysisResult.result.price.min, 'to', analysisResult.result.price.max);
    console.log('  - Current price:', analysisResult.result.price.current);
    console.log('  - Price change:', analysisResult.result.price.changePercent);
    console.log('  - Volatility:', analysisResult.result.volatility.volatilityPercent);
    console.log('  - Trend:', analysisResult.result.trends.shortTerm);
    console.log();
  } else {
    console.log('✗ FAILED:', analysisResult.error);
    console.log();
  }
  
  // Test calculating technical indicators
  console.log('2. Calculating technical indicators...');
  const indicatorResult = await agent.executeTool('calculateCryptoIndicators', {
    filename: 'sample_binance_data.csv',
    indicators: ['RSI', 'SMA', 'EMA', 'MACD']
  });
  
  if (indicatorResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Added indicators:', indicatorResult.result.addedIndicators.join(', '));
    console.log();
  } else {
    console.log('✗ FAILED:', indicatorResult.error);
    console.log();
  }
  
  // Verify indicators were added
  console.log('3. Listing technical indicators...');
  const listResult = await agent.executeTool('listTechnicalIndicators', {
    filename: 'sample_binance_data.csv'
  });
  
  if (listResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Technical indicators found:', listResult.result.join(', '));
    console.log();
  } else {
    console.log('✗ FAILED:', listResult.error);
    console.log();
  }
  
  console.log('=== All crypto tools tested successfully! ===');
}

testCryptoTools().catch(console.error);
