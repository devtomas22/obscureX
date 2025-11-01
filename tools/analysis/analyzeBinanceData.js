import { existsSync, readFileSync } from 'fs';

/**
 * Tool: Analyze Binance Data
 * Provides statistical analysis of Binance price data from CSV
 */
export default {
  name: 'analyzeBinanceData',
  description: 'Analyze Binance price data and provide statistics (volatility, trends, volume analysis)',
  parameters: { filename: 'string' },
  
  async execute(params) {
    const { filename } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file has insufficient data');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });
      data.push(row);
    }

    // Perform analysis
    const analysis = {
      totalRecords: data.length,
      timeRange: {
        start: new Date(parseInt(data[0].timestamp || data[0].open_time)).toISOString(),
        end: new Date(parseInt(data[data.length - 1].timestamp || data[data.length - 1].open_time)).toISOString()
      },
      price: this._analyzePrices(data),
      volume: this._analyzeVolume(data),
      volatility: this._calculateVolatility(data),
      trends: this._identifyTrends(data)
    };

    return analysis;
  },

  _analyzePrices(data) {
    const closes = data.map(d => parseFloat(d.close));
    const opens = data.map(d => parseFloat(d.open));
    const highs = data.map(d => parseFloat(d.high));
    const lows = data.map(d => parseFloat(d.low));

    const currentPrice = closes[closes.length - 1];
    const startPrice = closes[0];
    const priceChange = currentPrice - startPrice;
    const priceChangePercent = (priceChange / startPrice) * 100;

    return {
      current: currentPrice,
      start: startPrice,
      min: Math.min(...lows),
      max: Math.max(...highs),
      average: closes.reduce((a, b) => a + b, 0) / closes.length,
      change: priceChange,
      changePercent: priceChangePercent.toFixed(2) + '%'
    };
  },

  _analyzeVolume(data) {
    const volumes = data.map(d => parseFloat(d.volume));
    
    return {
      total: volumes.reduce((a, b) => a + b, 0),
      average: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      min: Math.min(...volumes),
      max: Math.max(...volumes)
    };
  },

  _calculateVolatility(data) {
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      const prevClose = parseFloat(data[i - 1].close);
      const close = parseFloat(data[i].close);
      returns.push((close - prevClose) / prevClose);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return {
      standardDeviation: stdDev,
      volatilityPercent: (stdDev * 100).toFixed(4) + '%',
      averageReturn: avgReturn,
      averageReturnPercent: (avgReturn * 100).toFixed(4) + '%'
    };
  },

  _identifyTrends(data) {
    const closes = data.map(d => parseFloat(d.close));
    
    // Simple trend identification using moving averages
    const sma20 = this._calculateSMA(closes, 20);
    const sma50 = closes.length >= 50 ? this._calculateSMA(closes, 50) : null;
    
    const currentPrice = closes[closes.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50 ? sma50[sma50.length - 1] : null;

    let trend = 'neutral';
    if (currentPrice > currentSMA20) {
      trend = 'bullish';
    } else if (currentPrice < currentSMA20) {
      trend = 'bearish';
    }

    return {
      shortTerm: trend,
      sma20: currentSMA20,
      sma50: currentSMA50,
      priceVsSMA20: ((currentPrice - currentSMA20) / currentSMA20 * 100).toFixed(2) + '%',
      priceVsSMA50: currentSMA50 ? ((currentPrice - currentSMA50) / currentSMA50 * 100).toFixed(2) + '%' : 'N/A'
    };
  },

  _calculateSMA(data, period) {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }
};
