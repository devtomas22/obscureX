import ObscureXAgent from './agent.js';

/**
 * Comprehensive example demonstrating Binance integration
 * and cryptocurrency analysis tools
 */

async function binanceExample() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  ObscureX AI Agent - Binance Crypto Analysis Example    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const agent = new ObscureXAgent();
  
  // Step 1: Download Binance Data
  console.log('Step 1: Downloading Binance Price Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Note: In this demo environment, direct API access to Binance may be blocked.');
  console.log('We\'ll use the sample data provided instead.\n');
  
  // Attempt to download (may fail due to network restrictions)
  const downloadResult = await agent.executeTool('downloadBinancePriceHistory', {
    symbol: 'BTCUSDT',
    interval: '1h',
    limit: 100,
    outputFile: 'binance_btcusdt_1h_live.csv'
  });
  
  let dataFile;
  if (downloadResult.success && downloadResult.result.success) {
    console.log('✓ Successfully downloaded live data from Binance!');
    console.log(`  Records: ${downloadResult.result.records}`);
    console.log(`  File: ${downloadResult.result.filename}`);
    console.log(`  Date range: ${downloadResult.result.startDate} to ${downloadResult.result.endDate}\n`);
    dataFile = downloadResult.result.filename;
  } else {
    console.log('⚠ Live download not available (network restriction)');
    console.log('✓ Using sample Binance data instead: sample_binance_data.csv\n');
    dataFile = 'sample_binance_data.csv';
  }
  
  // Step 2: Analyze the Data
  console.log('Step 2: Analyzing Binance Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const analysis = await agent.executeTool('analyzeBinanceData', {
    filename: dataFile
  });
  
  if (analysis.success) {
    const a = analysis.result;
    console.log('📊 Price Analysis:');
    console.log(`  Current Price:    $${a.price.current.toFixed(2)}`);
    console.log(`  Price Range:      $${a.price.min.toFixed(2)} - $${a.price.max.toFixed(2)}`);
    console.log(`  Average Price:    $${a.price.average.toFixed(2)}`);
    console.log(`  Price Change:     ${a.price.changePercent}\n`);
    
    console.log('📈 Volume Analysis:');
    console.log(`  Total Volume:     ${a.volume.total.toFixed(2)}`);
    console.log(`  Average Volume:   ${a.volume.average.toFixed(2)}`);
    console.log(`  Volume Range:     ${a.volume.min.toFixed(2)} - ${a.volume.max.toFixed(2)}\n`);
    
    console.log('📉 Volatility Metrics:');
    console.log(`  Standard Dev:     ${a.volatility.standardDeviation.toFixed(6)}`);
    console.log(`  Volatility:       ${a.volatility.volatilityPercent}`);
    console.log(`  Avg Return:       ${a.volatility.averageReturnPercent}\n`);
    
    console.log('🎯 Trend Analysis:');
    console.log(`  Short-term Trend: ${a.trends.shortTerm.toUpperCase()}`);
    console.log(`  SMA 20:           $${a.trends.sma20.toFixed(2)}`);
    console.log(`  Price vs SMA20:   ${a.trends.priceVsSMA20}`);
    if (a.trends.sma50) {
      console.log(`  SMA 50:           $${a.trends.sma50.toFixed(2)}`);
      console.log(`  Price vs SMA50:   ${a.trends.priceVsSMA50}`);
    }
    console.log();
  } else {
    console.log('✗ Failed to analyze data:', analysis.error);
  }
  
  // Step 3: Calculate Technical Indicators
  console.log('Step 3: Calculating Technical Indicators');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const indicatorResult = await agent.executeTool('calculateCryptoIndicators', {
    filename: dataFile,
    indicators: ['RSI', 'MACD', 'SMA', 'EMA']
  });
  
  if (indicatorResult.success) {
    console.log('✓ Technical indicators added successfully!');
    console.log(`  Added: ${indicatorResult.result.addedIndicators.join(', ')}\n`);
  } else {
    console.log('✗ Failed to add indicators:', indicatorResult.error);
  }
  
  // Step 4: List All Indicators
  console.log('Step 4: Listing All Technical Indicators in CSV');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const listResult = await agent.executeTool('listTechnicalIndicators', {
    filename: dataFile
  });
  
  if (listResult.success) {
    console.log('📋 Technical Indicators Found:');
    listResult.result.forEach(indicator => {
      console.log(`  • ${indicator}`);
    });
    console.log();
  } else {
    console.log('✗ Failed to list indicators:', listResult.error);
  }
  
  // Step 5: Generate ML Pipeline
  console.log('Step 5: Generating ML Pipeline for Binance Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const pipelineResult = await agent.executeTool('generateMLPipeline', {
    existingCode: null,
    prompt: 'Create a Binance BTC price prediction pipeline using CatBoost with technical indicators'
  });
  
  if (pipelineResult.success) {
    console.log('✓ ML Pipeline generated successfully!');
    console.log(`  File: ${pipelineResult.result.filename}`);
    console.log('  The pipeline includes:');
    console.log('    • Binance CSV data loading');
    console.log('    • Feature preparation and scaling');
    console.log('    • CatBoost model training');
    console.log('    • MSE calculation\n');
  } else {
    console.log('✗ Failed to generate pipeline:', pipelineResult.error);
  }
  
  // Summary
  console.log('══════════════════════════════════════════════════════════\n');
  console.log('✅ Demo Complete!');
  console.log('\nWhat you can do next:');
  console.log('  1. Modify the generated ML pipeline');
  console.log('  2. Run the orchestrator to optimize the model:');
  console.log(`     node agent.js optimize ${dataFile} 0.05 30`);
  console.log('  3. Download more Binance data for different pairs:');
  console.log('     ETHUSDT, BNBUSDT, ADAUSDT, etc.');
  console.log('  4. Experiment with different technical indicators');
  console.log('  5. Try different ML models (Neural Networks, ensemble methods)\n');
}

// Run the example
binanceExample().catch(error => {
  console.error('\nError running example:', error.message);
  process.exit(1);
});
