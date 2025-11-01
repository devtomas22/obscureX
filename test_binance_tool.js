import ObscureXAgent from './agent.js';

async function testBinanceTool() {
  const agent = new ObscureXAgent();
  
  console.log('=== Testing Binance Data Download Tool ===\n');
  
  // Test downloading BTC/USDT 1-hour data
  console.log('1. Downloading BTCUSDT 1-hour data (last 100 candles)...');
  const result = await agent.executeTool('downloadBinancePriceHistory', {
    symbol: 'BTCUSDT',
    interval: '1h',
    limit: 100,
    outputFile: 'binance_btcusdt_1h.csv'
  });
  
  if (result.success) {
    console.log('✓ SUCCESS!');
    console.log('  Records downloaded:', result.result.records);
    console.log('  File:', result.result.filename);
    console.log('  Start date:', result.result.startDate);
    console.log('  End date:', result.result.endDate);
    console.log();
  } else {
    console.log('✗ FAILED:', result.error);
    console.log();
  }
  
  // Test analyzing the downloaded data
  console.log('2. Analyzing the downloaded data...');
  const analysisResult = await agent.executeTool('analyzeBinanceData', {
    filename: 'binance_btcusdt_1h.csv'
  });
  
  if (analysisResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Analysis results:');
    console.log(JSON.stringify(analysisResult.result, null, 2));
    console.log();
  } else {
    console.log('✗ FAILED:', analysisResult.error);
    console.log();
  }
  
  // Test calculating technical indicators
  console.log('3. Calculating technical indicators...');
  const indicatorResult = await agent.executeTool('calculateCryptoIndicators', {
    filename: 'binance_btcusdt_1h.csv',
    indicators: ['RSI', 'SMA', 'EMA']
  });
  
  if (indicatorResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Added indicators:', indicatorResult.result.addedIndicators);
    console.log();
  } else {
    console.log('✗ FAILED:', indicatorResult.error);
    console.log();
  }
  
  // Verify indicators were added
  console.log('4. Verifying indicators in CSV...');
  const listResult = await agent.executeTool('listTechnicalIndicators', {
    filename: 'binance_btcusdt_1h.csv'
  });
  
  if (listResult.success) {
    console.log('✓ SUCCESS!');
    console.log('  Technical indicators found:', listResult.result);
  } else {
    console.log('✗ FAILED:', listResult.error);
  }
}

testBinanceTool().catch(console.error);
