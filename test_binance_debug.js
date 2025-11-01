import ObscureXAgent from './agent.js';

async function test() {
  const agent = new ObscureXAgent();
  
  const result = await agent.executeTool('downloadBinancePriceHistory', {
    symbol: 'BTCUSDT',
    interval: '1h',
    limit: 50,
    outputFile: 'test_binance.csv'
  });
  
  console.log('Full result:');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
