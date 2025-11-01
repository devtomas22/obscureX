import { existsSync, readFileSync } from 'fs';

/**
 * Tool: List Technical Indicators
 * Lists all technical indicators (non-standard columns) in a CSV file
 * Works with Binance CSV format and other price data formats
 */
export default {
  name: 'listTechnicalIndicators',
  description: 'List technical indicators added to a CSV file (works with Binance price data)',
  parameters: { filename: 'string' },
  
  async execute(params) {
    const { filename } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    // Filter out standard OHLCV columns and Binance-specific columns
    // Binance format: timestamp, open, high, low, close, volume, close_time, quote_asset_volume, 
    // number_of_trades, taker_buy_base_asset_volume, taker_buy_quote_asset_volume, ignore
    const standardColumns = [
      'date', 'time', 'timestamp', 'open', 'high', 'low', 'close', 'volume',
      'open_time', 'close_time', 'quote_asset_volume', 'quote_volume',
      'number_of_trades', 'num_trades', 'trades',
      'taker_buy_base_asset_volume', 'taker_buy_volume', 
      'taker_buy_quote_asset_volume', 'taker_buy_quote_volume',
      'ignore', 'symbol', 'interval'
    ];
    
    const indicators = headers.filter(h => 
      !standardColumns.includes(h.toLowerCase())
    );

    return indicators;
  }
};
