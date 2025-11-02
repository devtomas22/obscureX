import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync, execFileSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

/**
 * Tool: Calculate Crypto Technical Indicators
 * Calculates and adds cryptocurrency-specific technical indicators to Binance CSV data
 * Uses AI-generated Python code for indicator calculations with caching in long-term memory
 */
export default {
  name: 'calculateCryptoIndicators',
  description: 'Calculate and add technical indicators (RSI, MACD, Bollinger Bands, etc.) to Binance CSV data using AI-generated Python code',
  parameters: { 
    filename: 'string',
    indicators: 'array' // Array of indicator names: ['RSI', 'MACD', 'BB', 'SMA', 'EMA']
  },
  
  async execute(params, context) {
    const { filename, indicators = ['RSI', 'MACD', 'SMA'] } = params;
    const { aiService, longTermMemory, saveMemory, longTermMemoryPath } = context;
    
    if (!aiService || !aiService.isAvailable()) {
      throw new Error('AI (Google Gemini API) is required for calculating technical indicators. Please provide an API key.');
    }
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    // Check if we have cached Python code for these indicators
    const cacheKey = `technical_indicators_${indicators.sort().join('_')}`;
    let pythonCode = null;
    
    const cachedEntry = longTermMemory.entries.find(e => e.key === cacheKey);
    if (cachedEntry) {
      console.log(`Using cached Python code for indicators: ${indicators.join(', ')}`);
      pythonCode = cachedEntry.value.code;
    } else {
      console.log(`Generating Python code for indicators: ${indicators.join(', ')}`);
      pythonCode = await this._generateIndicatorPython(indicators, aiService);
      
      // Cache the generated code in long-term memory
      longTermMemory.entries.push({
        key: cacheKey,
        value: { 
          code: pythonCode,
          indicators: indicators 
        },
        metadata: {
          type: 'technical_indicator_code',
          timestamp: new Date().toISOString(),
          persistent: true
        }
      });
      saveMemory(longTermMemoryPath, longTermMemory);
      console.log(`Cached Python code for future use`);
    }

    // Execute the Python code with the CSV file
    const result = await this._executePythonIndicators(pythonCode, filename);

    return {
      success: true,
      filename: filename,
      addedIndicators: result.addedIndicators,
      message: `Added ${result.addedIndicators.length} indicators to ${filename} using AI-generated Python code`
    };
  },

  /**
   * Generate Python code for calculating technical indicators using AI
   */
  async _generateIndicatorPython(indicators, aiService) {
    const systemPrompt = `You are an expert Python developer specializing in technical analysis and financial indicators.
Generate complete, production-ready Python code for calculating technical indicators from CSV data.
The code should:
- Be complete and executable
- Read a CSV file passed as a command-line argument
- Calculate the requested technical indicators
- Write the results back to the same CSV file
- Handle Binance CSV format (timestamp, open, high, low, close, volume, etc.)
- Use pandas for data manipulation
- Include proper error handling`;

    const userPrompt = `Generate complete Python code to calculate these technical indicators and add them to a CSV file: ${indicators.join(', ')}

Requirements:
- Read CSV filename from sys.argv[1]
- Calculate indicators: ${indicators.map(i => {
      if (i.toUpperCase() === 'RSI') return 'RSI (14 period)';
      if (i.toUpperCase() === 'MACD') return 'MACD (12, 26, 9) with signal and histogram';
      if (i.toUpperCase() === 'BB' || i.toUpperCase() === 'BOLLINGER') return 'Bollinger Bands (20 period, 2 std dev)';
      if (i.toUpperCase() === 'SMA') return 'SMA (20 period)';
      if (i.toUpperCase() === 'EMA') return 'EMA (12 period)';
      return i;
    }).join(', ')}
- Add new columns to the CSV for each indicator
- Write the updated CSV back to the same file
- Use the 'close' column for calculations
- Handle NaN values appropriately (fill with 0 for initial periods)
- Print "Success: Added [indicator names]" at the end

Return ONLY the Python code, no explanations or markdown.`;

    return await aiService.generateCode(userPrompt, systemPrompt, 4096);
  },

  /**
   * Execute Python code to calculate indicators
   */
  async _executePythonIndicators(pythonCode, filename) {
    const tempFile = join(tmpdir(), `calculate_indicators_${randomBytes(8).toString('hex')}.py`);
    
    try {
      writeFileSync(tempFile, pythonCode, 'utf-8');
      
      // Use execFileSync to prevent command injection
      const output = execFileSync('python3', [tempFile, filename], { 
        encoding: 'utf-8',
        timeout: 300000,
        cwd: process.cwd()
      });
      
      // Parse the output to find added indicators
      const successMatch = output.match(/Success:\s*Added\s*\[?([^\]]+)\]?/i);
      let addedIndicators = [];
      if (successMatch) {
        addedIndicators = successMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
      }
      
      // If not found in output, try to detect from CSV
      if (addedIndicators.length === 0) {
        const content = readFileSync(filename, 'utf-8');
        const headers = content.split('\n')[0].split(',').map(h => h.trim());
        const baseHeaders = ['timestamp', 'open', 'high', 'low', 'close', 'volume', 
                           'close_time', 'quote_volume', 'trades', 
                           'taker_buy_volume', 'taker_buy_quote_volume'];
        addedIndicators = headers.filter(h => !baseHeaders.includes(h));
      }
      
      return {
        addedIndicators,
        output
      };
    } catch (error) {
      throw new Error(`Failed to execute Python indicator calculation: ${error.message}`);
    } finally {
      // Clean up temp file
      try {
        if (existsSync(tempFile)) {
          unlinkSync(tempFile);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }
};
