import { existsSync, readFileSync, writeFileSync } from 'fs';

/**
 * Tool: Calculate Crypto Technical Indicators
 * Calculates and adds cryptocurrency-specific technical indicators to Binance CSV data
 */
export default {
  name: 'calculateCryptoIndicators',
  description: 'Calculate and add technical indicators (RSI, MACD, Bollinger Bands, etc.) to Binance CSV data',
  parameters: { 
    filename: 'string',
    indicators: 'array' // Array of indicator names: ['RSI', 'MACD', 'BB', 'SMA', 'EMA']
  },
  
  async execute(params) {
    const { filename, indicators = ['RSI', 'MACD', 'SMA'] } = params;
    
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

    // Calculate requested indicators
    const newHeaders = [...headers];
    const addedIndicators = [];

    for (const indicator of indicators) {
      switch (indicator.toUpperCase()) {
        case 'RSI':
          this._addRSI(data, newHeaders, addedIndicators);
          break;
        case 'MACD':
          this._addMACD(data, newHeaders, addedIndicators);
          break;
        case 'BB':
        case 'BOLLINGER':
          this._addBollingerBands(data, newHeaders, addedIndicators);
          break;
        case 'SMA':
          this._addSMA(data, newHeaders, addedIndicators, 20);
          break;
        case 'EMA':
          this._addEMA(data, newHeaders, addedIndicators, 12);
          break;
        default:
          console.warn(`Unknown indicator: ${indicator}`);
      }
    }

    // Write updated CSV
    const csvLines = [newHeaders.join(',')];
    for (const row of data) {
      const values = newHeaders.map(h => row[h] || '0');
      csvLines.push(values.join(','));
    }

    writeFileSync(filename, csvLines.join('\n') + '\n', 'utf-8');

    return {
      success: true,
      filename: filename,
      addedIndicators: addedIndicators,
      message: `Added ${addedIndicators.length} indicators to ${filename}`
    };
  },

  _addRSI(data, headers, addedIndicators, period = 14) {
    const closes = data.map(d => parseFloat(d.close));
    const rsi = this._calculateRSI(closes, period);
    
    const headerName = `RSI_${period}`;
    if (!headers.includes(headerName)) {
      headers.push(headerName);
      addedIndicators.push(headerName);
    }
    
    data.forEach((row, i) => {
      row[headerName] = i < period ? '0' : rsi[i - period].toFixed(2);
    });
  },

  _addMACD(data, headers, addedIndicators) {
    const closes = data.map(d => parseFloat(d.close));
    const macd = this._calculateMACD(closes);
    
    const headers_to_add = ['MACD', 'MACD_signal', 'MACD_hist'];
    headers_to_add.forEach(h => {
      if (!headers.includes(h)) {
        headers.push(h);
        addedIndicators.push(h);
      }
    });
    
    data.forEach((row, i) => {
      if (i < 26) {
        row['MACD'] = '0';
        row['MACD_signal'] = '0';
        row['MACD_hist'] = '0';
      } else {
        const idx = i - 26;
        row['MACD'] = macd.macd[idx].toFixed(4);
        row['MACD_signal'] = macd.signal[idx].toFixed(4);
        row['MACD_hist'] = macd.histogram[idx].toFixed(4);
      }
    });
  },

  _addBollingerBands(data, headers, addedIndicators, period = 20, stdDev = 2) {
    const closes = data.map(d => parseFloat(d.close));
    const bb = this._calculateBollingerBands(closes, period, stdDev);
    
    const headers_to_add = ['BB_upper', 'BB_middle', 'BB_lower'];
    headers_to_add.forEach(h => {
      if (!headers.includes(h)) {
        headers.push(h);
        addedIndicators.push(h);
      }
    });
    
    data.forEach((row, i) => {
      if (i < period - 1) {
        row['BB_upper'] = '0';
        row['BB_middle'] = '0';
        row['BB_lower'] = '0';
      } else {
        const idx = i - period + 1;
        row['BB_upper'] = bb.upper[idx].toFixed(4);
        row['BB_middle'] = bb.middle[idx].toFixed(4);
        row['BB_lower'] = bb.lower[idx].toFixed(4);
      }
    });
  },

  _addSMA(data, headers, addedIndicators, period) {
    const closes = data.map(d => parseFloat(d.close));
    const sma = this._calculateSMA(closes, period);
    
    const headerName = `SMA_${period}`;
    if (!headers.includes(headerName)) {
      headers.push(headerName);
      addedIndicators.push(headerName);
    }
    
    data.forEach((row, i) => {
      row[headerName] = i < period - 1 ? '0' : sma[i - period + 1].toFixed(4);
    });
  },

  _addEMA(data, headers, addedIndicators, period) {
    const closes = data.map(d => parseFloat(d.close));
    const ema = this._calculateEMA(closes, period);
    
    const headerName = `EMA_${period}`;
    if (!headers.includes(headerName)) {
      headers.push(headerName);
      addedIndicators.push(headerName);
    }
    
    data.forEach((row, i) => {
      row[headerName] = ema[i].toFixed(4);
    });
  },

  // Technical indicator calculations
  _calculateRSI(closes, period) {
    const rsi = [];
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    for (let i = period; i <= gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  },

  _calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const emaFast = this._calculateEMA(closes, fastPeriod);
    const emaSlow = this._calculateEMA(closes, slowPeriod);
    
    const macdLine = [];
    for (let i = 0; i < closes.length; i++) {
      macdLine.push(emaFast[i] - emaSlow[i]);
    }
    
    const signalLine = this._calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);
    const histogram = [];
    
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + slowPeriod - 1] - signalLine[i]);
    }
    
    return {
      macd: macdLine.slice(slowPeriod - 1),
      signal: signalLine,
      histogram: histogram
    };
  },

  _calculateBollingerBands(closes, period, stdDevMultiplier) {
    const sma = this._calculateSMA(closes, period);
    const upper = [];
    const middle = sma;
    const lower = [];
    
    for (let i = 0; i < sma.length; i++) {
      const dataSlice = closes.slice(i, i + period);
      const mean = sma[i];
      const variance = dataSlice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(mean + stdDevMultiplier * stdDev);
      lower.push(mean - stdDevMultiplier * stdDev);
    }
    
    return { upper, middle, lower };
  },

  _calculateSMA(data, period) {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  },

  _calculateEMA(data, period) {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for first value
    let prevEMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(prevEMA);
    
    // Calculate EMA for remaining values
    for (let i = 1; i < data.length; i++) {
      const currentEMA = (data[i] - prevEMA) * multiplier + prevEMA;
      ema.push(currentEMA);
      prevEMA = currentEMA;
    }
    
    return ema;
  }
};
