import { writeFileSync, existsSync } from 'fs';
import { createWriteStream } from 'fs';
import https from 'https';

/**
 * Tool: Download Binance Price History
 * Downloads historical price data from Binance API
 */
export default {
  name: 'downloadBinancePriceHistory',
  description: 'Download historical cryptocurrency price data from Binance in CSV format',
  parameters: { 
    symbol: 'string',  // e.g., 'BTCUSDT'
    interval: 'string', // e.g., '1h', '1d', '15m'
    startTime: 'string|null', // Optional: ISO date or timestamp
    endTime: 'string|null',   // Optional: ISO date or timestamp
    limit: 'number',   // Optional: max 1000 per request
    outputFile: 'string' // Output CSV filename
  },
  
  async execute(params) {
    const { 
      symbol, 
      interval, 
      startTime = null, 
      endTime = null, 
      limit = 1000,
      outputFile 
    } = params;
    
    try {
      // Validate parameters
      const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
      if (!validIntervals.includes(interval)) {
        throw new Error(`Invalid interval. Must be one of: ${validIntervals.join(', ')}`);
      }
      
      if (limit > 1000) {
        throw new Error('Limit cannot exceed 1000 per request');
      }

      // Build API URL
      let url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
      
      if (startTime) {
        const startMs = this._parseTime(startTime);
        url += `&startTime=${startMs}`;
      }
      
      if (endTime) {
        const endMs = this._parseTime(endTime);
        url += `&endTime=${endMs}`;
      }

      console.log(`Downloading ${symbol} data from Binance (${interval} interval)...`);
      
      // Fetch data from Binance API
      const data = await this._fetchBinanceData(url);
      
      if (!data || data.length === 0) {
        throw new Error('No data received from Binance API');
      }

      // Convert to CSV format
      const csv = this._convertToCSV(data);
      
      // Write to file
      writeFileSync(outputFile, csv, 'utf-8');
      
      console.log(`✓ Downloaded ${data.length} candles to ${outputFile}`);
      
      return {
        success: true,
        symbol: symbol,
        interval: interval,
        records: data.length,
        filename: outputFile,
        startDate: new Date(data[0][0]).toISOString(),
        endDate: new Date(data[data.length - 1][0]).toISOString(),
        message: `Downloaded ${data.length} ${interval} candles for ${symbol}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to download Binance data: ${error.message}`
      };
    }
  },

  /**
   * Parse time string to milliseconds timestamp
   */
  _parseTime(timeStr) {
    // If already a number (timestamp), return it
    if (!isNaN(timeStr)) {
      return parseInt(timeStr);
    }
    
    // Parse ISO date string
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }
    
    return date.getTime();
  },

  /**
   * Fetch data from Binance API
   */
  async _fetchBinanceData(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            
            // Check for API errors
            if (json.code && json.msg) {
              reject(new Error(`Binance API error: ${json.msg}`));
              return;
            }
            
            resolve(json);
          } catch (error) {
            reject(new Error(`Failed to parse Binance response: ${error.message}`));
          }
        });
      }).on('error', (error) => {
        reject(new Error(`HTTP request failed: ${error.message}`));
      });
    });
  },

  /**
   * Convert Binance klines data to CSV format
   * Binance klines format:
   * [
   *   [
   *     1499040000000,      // 0: Open time
   *     "0.01634000",       // 1: Open
   *     "0.80000000",       // 2: High
   *     "0.01575800",       // 3: Low
   *     "0.01577100",       // 4: Close
   *     "148976.11427815",  // 5: Volume
   *     1499644799999,      // 6: Close time
   *     "2434.19055334",    // 7: Quote asset volume
   *     308,                // 8: Number of trades
   *     "1756.87402397",    // 9: Taker buy base asset volume
   *     "28.46694368",      // 10: Taker buy quote asset volume
   *     "17928899.62484339" // 11: Ignore
   *   ]
   * ]
   */
  _convertToCSV(data) {
    // CSV header matching Binance format
    const header = 'timestamp,open,high,low,close,volume,close_time,quote_volume,trades,taker_buy_volume,taker_buy_quote_volume\n';
    
    const rows = data.map(candle => {
      return [
        candle[0],  // timestamp (open time)
        candle[1],  // open
        candle[2],  // high
        candle[3],  // low
        candle[4],  // close
        candle[5],  // volume
        candle[6],  // close time
        candle[7],  // quote volume
        candle[8],  // trades
        candle[9],  // taker buy volume
        candle[10]  // taker buy quote volume
      ].join(',');
    }).join('\n');
    
    return header + rows + '\n';
  }
};
