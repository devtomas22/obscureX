# ObscureX AI Agent

A self-contained AI agent with modular tools for cryptocurrency analysis, ML pipeline optimization, and Binance data integration. **Requires Anthropic's Claude AI for all code generation** - the agent uses AI to generate Python code for technical indicators and ML pipelines, with intelligent caching to optimize performance.

## Features

### 16 Built-in Modular Tools

**Binance & Cryptocurrency:**
1. **Download Binance Price History** - Download historical price data from Binance API in CSV format
2. **Analyze Binance Data** - Statistical analysis including volatility, trends, and volume analysis
3. **Calculate Crypto Indicators** - Calculate technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA) **using AI-generated Python code with caching**

**CSV & Technical Indicators:**
4. **List Technical Indicators** - List all technical indicators in a CSV file (Binance-aware)
5. **Add Technical Indicator** - Add a new technical indicator column to a CSV
6. **Remove Technical Indicator** - Remove a technical indicator from a CSV

**ML Pipeline Management:**
7. **Test ML Pipeline** - Execute a Python ML pipeline and return MSE value (optimized for Binance data)
8. **Generate ML Pipeline** - Create ML pipeline code using CatBoost and/or Neural Networks (**Requires AI** - no template fallback, Binance-optimized)
9. **List Python Modules** - List all installed Python packages
10. **Install Python Module** - Install a Python package using pip

**Memory Management:**
11. **Store Memory** - Store information in short-term memory (session-based)
12. **Retrieve Memory** - Retrieve information from short-term memory
13. **Search Memory** - Search through short-term memory
14. **Store Long-Term Memory** - Store information persistently across sessions
15. **Retrieve Long-Term Memory** - Retrieve information from long-term memory
16. **Search Long-Term Memory** - Search through long-term memory

### Modular Architecture

Tools are now organized in a modular directory structure:
- **`tools/binance/`** - Binance API integration and data download
- **`tools/analysis/`** - Cryptocurrency data analysis and technical indicators
- **`tools/csv/`** - CSV file operations (all Binance CSV format aware)
- **`tools/ml/`** - Machine learning pipeline management
- **`tools/memory/`** - Short-term and long-term memory operations

### AI-First Approach

**All code generation now requires AI:**
- Technical indicator calculations use AI-generated Python code (cached in long-term memory)
- ML pipeline generation always uses AI (no template fallback)
- Python code is executed via child_process for maximum flexibility
- Smart caching prevents redundant code generation

### Orchestrator

The agent includes an intelligent orchestrator that:
- Runs optimization loops automatically
- Generates and tests ML pipelines iteratively for Binance price prediction
- Uses AI to determine optimization strategies
- Stores results in memory (short-term and long-term)
- Continues until MSE threshold is met or max iterations reached
- Learns from previous attempts

### Binance Data Support

All tools understand the Binance CSV format:
- `timestamp` - Open time in milliseconds
- `open`, `high`, `low`, `close` - OHLC price data
- `volume` - Base asset volume
- `close_time` - Close time in milliseconds
- `quote_volume` - Quote asset volume
- `trades` - Number of trades
- `taker_buy_volume` - Taker buy base asset volume
- `taker_buy_quote_volume` - Taker buy quote asset volume

## Installation

```bash
git clone https://github.com/devtomas22/obscureX.git
cd obscureX
npm install
```

## Setup

**Anthropic API key is now required** for all code generation features:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Or pass it when creating the agent:

```javascript
const agent = new ObscureXAgent('your-api-key-here');
```

Without an API key, only basic tools like memory management, CSV operations (list/add/remove), and Python module management will work.

## Usage

### Command Line Interface

```bash
# List all available tools
node agent.js list-tools

# Run the orchestrator (optimization loop) with Binance data
node agent.js optimize [dataFile] [threshold] [maxIterations]

# Example: Optimize Binance data until MSE < 0.05, max 30 iterations
node agent.js optimize binance_btcusdt_1h.csv 0.05 30

# Run memory and orchestrator demos
npm run demo
```

### Programmatic Usage

#### Working with Binance Data

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent();

// 1. Download Binance price data
await agent.executeTool('downloadBinancePriceHistory', {
  symbol: 'BTCUSDT',
  interval: '1h',      // 1m, 5m, 15m, 1h, 4h, 1d, etc.
  limit: 1000,         // Max 1000 per request
  outputFile: 'binance_btcusdt_1h.csv'
});

// 2. Analyze the downloaded data
const analysis = await agent.executeTool('analyzeBinanceData', {
  filename: 'binance_btcusdt_1h.csv'
});
console.log('Price analysis:', analysis.result);

// 3. Calculate technical indicators
await agent.executeTool('calculateCryptoIndicators', {
  filename: 'binance_btcusdt_1h.csv',
  indicators: ['RSI', 'MACD', 'BB', 'SMA', 'EMA']
});

// 4. List all indicators in the CSV
const indicators = await agent.executeTool('listTechnicalIndicators', {
  filename: 'binance_btcusdt_1h.csv'
});
console.log('Technical indicators:', indicators.result);
```

#### Basic Tool Execution

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent();

// Execute any tool
const result = await agent.executeTool('listTechnicalIndicators', {
  filename: 'data.csv'
});
```

#### Using the Orchestrator for Binance Price Prediction

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);

// Run optimization loop with Binance data
const result = await agent.runOptimizationLoop({
  dataFile: 'binance_btcusdt_1h.csv',
  mseThreshold: 0.05,
  maxIterations: 50,
  initialPrompt: 'Create a price prediction pipeline for Binance data using CatBoost',
  verbose: true
});

console.log(`Best MSE: ${result.bestMSE}`);
console.log(`Iterations: ${result.iterations}`);
```

#### Memory Management

```javascript
// Store in short-term memory (session-based)
await agent.executeTool('storeMemory', {
  key: 'experiment_1',
  value: { mse: 0.15, approach: 'CatBoost' },
  metadata: { type: 'experiment' }
});

// Store in long-term memory (persistent)
await agent.executeTool('storeLongTermMemory', {
  key: 'best_model',
  value: { mse: 0.05, code: '...' },
  metadata: { domain: 'price_prediction' }
});

// Search memory
const results = await agent.executeTool('searchMemory', {
  query: 'experiment'
});

// Retrieve from long-term memory
const best = await agent.executeTool('retrieveLongTermMemory', {
  key: 'best_model'
});
```

## How the Orchestrator Works

1. **Initialize**: Loads previous best from long-term memory if available
2. **Generate**: Creates initial ML pipeline using AI or optimizes existing code
3. **Test**: Executes the pipeline and extracts MSE
4. **Store**: Saves iteration results in short-term memory
5. **Evaluate**: Compares with best MSE, updates if improved
6. **Learn**: Uses AI to analyze history and suggest next optimization
7. **Persist**: Stores best pipeline in long-term memory
8. **Repeat**: Continues until threshold met or max iterations reached

### Optimization Strategies

The orchestrator automatically applies various strategies:
- Hyperparameter tuning (GridSearchCV, RandomizedSearchCV)
- Feature engineering (polynomial features, interactions)
- Cross-validation for generalization
- Ensemble methods
- Feature selection
- Regularization
- Different preprocessing techniques

## Memory System

### Short-Term Memory
- Stored in `agent_memory.json`
- Session-based (current run)
- Tracks iterations, experiments, temporary data
- Automatically cleared between major runs

### Long-Term Memory
- Stored in `agent_longterm_memory.json`
- Persistent across sessions
- Tracks best models, successful approaches, learnings
- Keeps history of changes
- Used to resume optimization from previous best

## Tool Documentation

### Binance & Cryptocurrency Tools

#### 1. Download Binance Price History
```javascript
await agent.executeTool('downloadBinancePriceHistory', {
  symbol: 'BTCUSDT',           // Trading pair
  interval: '1h',              // 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 3d, 1w, 1M
  limit: 1000,                 // Number of candles (max 1000)
  startTime: '2024-01-01',     // Optional: ISO date or timestamp
  endTime: null,               // Optional: ISO date or timestamp
  outputFile: 'binance_btcusdt_1h.csv'
});
// Downloads and saves data in Binance CSV format
```

#### 2. Analyze Binance Data
```javascript
const analysis = await agent.executeTool('analyzeBinanceData', {
  filename: 'binance_btcusdt_1h.csv'
});
// Returns comprehensive analysis:
// - Price statistics (min, max, average, change %)
// - Volume analysis (total, average, min, max)
// - Volatility metrics (standard deviation, average return)
// - Trend identification (bullish/bearish/neutral)
// - Moving average comparisons (SMA20, SMA50)
```

#### 3. Calculate Crypto Technical Indicators
```javascript
await agent.executeTool('calculateCryptoIndicators', {
  filename: 'binance_btcusdt_1h.csv',
  indicators: ['RSI', 'MACD', 'BB', 'SMA', 'EMA']
});
// Uses AI-generated Python code (cached for performance) to add technical indicators:
// - RSI (Relative Strength Index)
// - MACD (Moving Average Convergence Divergence)
// - BB (Bollinger Bands: upper, middle, lower)
// - SMA (Simple Moving Average)
// - EMA (Exponential Moving Average)
```

### CSV Tools (Binance-Aware)

#### 4. List Technical Indicators
```javascript
await agent.executeTool('listTechnicalIndicators', {
  filename: 'data.csv'
});
// Returns: ['SMA_20', 'RSI_14', 'MACD', 'BB_upper', 'BB_lower']
// Filters out standard Binance columns automatically
```

#### 5. Add Technical Indicator
```javascript
await agent.executeTool('addTechnicalIndicator', {
  filename: 'data.csv',
  indicatorName: 'SMA_50'
});
```

#### 6. Remove Technical Indicator
```javascript
await agent.executeTool('removeTechnicalIndicator', {
  filename: 'data.csv',
  indicatorName: 'SMA_50'
});
```

### ML Pipeline Tools (Binance-Optimized)

#### 7. Test ML Pipeline
```javascript
const pythonCode = `
import pandas as pd
import numpy as np
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

# Works with Binance CSV format
df = pd.read_csv('binance_btcusdt_1h.csv')
# ... your ML pipeline code
print(f'MSE: {mse}')
`;

await agent.executeTool('testMLPipeline', { pythonCode });
// Returns: { success: true, mse: 0.01, output: "..." }
```

#### 8. Generate ML Pipeline (AI-Powered - Required)
```javascript
// Create new pipeline for Binance data (requires Anthropic API key)
await agent.executeTool('generateMLPipeline', {
  existingCode: null,
  prompt: 'Create a Binance price prediction pipeline using CatBoost with feature engineering'
});

// Optimize existing pipeline
await agent.executeTool('generateMLPipeline', {
  existingCode: existingPipelineCode,
  prompt: 'Add hyperparameter tuning and cross-validation for crypto data'
});
// AI always generates code - no template fallback
// Generated code automatically handles Binance CSV format
```

#### 9. List Python Modules
```javascript
await agent.executeTool('listPythonModules', {});
// Returns: ['numpy', 'pandas', 'scikit-learn', 'catboost', ...]
```

#### 10. Install Python Module
```javascript
await agent.executeTool('installPythonModule', {
  moduleName: 'catboost'
});
```

### Memory Tools

#### 11-13. Short-Term Memory
```javascript
// Store
await agent.executeTool('storeMemory', {
  key: 'current_mse',
  value: 0.15,
  metadata: { iteration: 5 }
});

// Retrieve
await agent.executeTool('retrieveMemory', { key: 'current_mse' });

// Search
await agent.executeTool('searchMemory', { query: 'mse' });
```

#### 11-13. Long-Term Memory
```javascript
// Store
await agent.executeTool('storeLongTermMemory', {
  key: 'best_approach_2024',
  value: { technique: 'CatBoost', mse: 0.05 },
  metadata: { year: 2024 }
});

// Retrieve
await agent.executeTool('retrieveLongTermMemory', { 
  key: 'best_approach_2024' 
});

// Search
await agent.executeTool('searchLongTermMemory', { 
  query: 'CatBoost' 
});
```

## Examples

### Quick Start with Binance Data

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent();

// Download Binance data
await agent.executeTool('downloadBinancePriceHistory', {
  symbol: 'BTCUSDT',
  interval: '1h',
  limit: 500,
  outputFile: 'btc_data.csv'
});

// Analyze it
const analysis = await agent.executeTool('analyzeBinanceData', {
  filename: 'btc_data.csv'
});
console.log('Volatility:', analysis.result.volatility.volatilityPercent);
console.log('Trend:', analysis.result.trends.shortTerm);

// Add indicators
await agent.executeTool('calculateCryptoIndicators', {
  filename: 'btc_data.csv',
  indicators: ['RSI', 'MACD', 'SMA']
});

// Train ML model
await agent.runOptimizationLoop({
  dataFile: 'btc_data.csv',
  mseThreshold: 0.05,
  maxIterations: 30
});
```

See `examples.js` for basic tool usage and `orchestrator_demo.js` for memory and orchestrator examples.

```bash
# Run basic examples
node examples.js

# Run orchestrator demo
npm run demo

# Test crypto tools
node test_crypto_tools.js
```

## Architecture

- **ObscureXAgent Class**: Main agent with modular tool loading
- **Anthropic Integration**: Uses Claude for intelligent code generation
- **Memory System**: Dual-layer (short-term + long-term) JSON storage
- **Orchestrator**: Automated optimization loop with learning for Binance data
- **Modular Tools**: 16 tools organized in 5 categories
  - `tools/binance/` - Binance API integration (1 tool)
  - `tools/analysis/` - Crypto analysis and indicators (2 tools)
  - `tools/csv/` - CSV operations (3 tools)
  - `tools/ml/` - ML pipeline management (4 tools)
  - `tools/memory/` - Memory operations (6 tools)

## Requirements

- Node.js 20.x or higher
- Python 3.x with pip
- Python packages: numpy, pandas, scikit-learn, catboost (optional)
- **Anthropic API key (REQUIRED for code generation features)**
- Internet connection (for Binance API data download)

## API Key

The agent **requires** an Anthropic API key for AI-powered code generation features. Get your key at: https://console.anthropic.com/

**Without an API key:**
- Technical indicator calculations will fail (requires AI)
- ML pipeline generation will fail (requires AI)
- Basic tools (memory, CSV list/add/remove, Python modules) will still work

## New in Version 2.2 (AI-First Update)

- ✨ **AI-first code generation** - All Python code now generated by AI
- 🧠 **Intelligent caching** - Technical indicator code cached in long-term memory
- ⚡ **Performance optimization** - Cached code reused across sessions
- 🚫 **No template fallback** - ML pipeline generation requires AI (more reliable)
- 🐍 **Python execution** - All generated code runs via child_process

## Previous Updates (Version 2.1)

- ✨ **Modular tool architecture** - Tools organized in separate files by category
- 🔄 **Binance integration** - Download and analyze cryptocurrency data
- 📊 **Advanced crypto indicators** - RSI, MACD, Bollinger Bands, SMA, EMA
- 📈 **Binance-optimized ML** - Pipelines specifically designed for crypto data
- 🎯 **Improved CSV handling** - Automatic detection of Binance format

## License

ISC License - See LICENSE file for details

## Contributing

This is a demonstration project showcasing AI agent architecture with orchestration and memory management.