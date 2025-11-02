# Migration Guide: JavaScript to Python

This guide helps you migrate from the JavaScript version of ObscureX to the Python version.

## Overview

The Python version maintains the same architecture, tool names, and functionality as the JavaScript version, but uses Python idioms and async/await patterns.

## Key Differences

### 1. Package Structure

**JavaScript:**
```
obscureX/
├── agent.js
├── services/AIService.js
└── tools/
    ├── memory/storeMemory.js
    └── ...
```

**Python:**
```
obscurex/
├── agent.py
├── services/ai_service.py
└── tools/
    ├── memory/store_memory.py
    └── ...
```

### 2. Installation

**JavaScript:**
```bash
npm install
```

**Python:**
```bash
pip install -r requirements.txt
# or
pip install -e .
```

### 3. Environment Variables

Both versions use the same environment variables:

```bash
# JavaScript
export GOOGLE_API_KEY='your-key'

# Python (same)
export GOOGLE_API_KEY='your-key'
```

### 4. Import/Initialization

**JavaScript:**
```javascript
import ObscureXAgent from './agent.js';
const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);
```

**Python:**
```python
from obscurex import ObscureXAgent
agent = ObscureXAgent(api_key=os.environ.get('GOOGLE_API_KEY'))
```

### 5. Async/Await

**JavaScript:**
```javascript
const result = await agent.executeTool('toolName', { param: 'value' });
```

**Python:**
```python
result = await agent.execute_tool('toolName', {'param': 'value'})
# Note: Must be called within an async function and run with asyncio
```

### 6. Running Async Code

**JavaScript:**
```javascript
// Top-level await works in ES modules
const result = await agent.listTools();
```

**Python:**
```python
import asyncio

async def main():
    result = await agent.list_tools()
    
asyncio.run(main())
```

## Code Examples

### Listing Tools

**JavaScript:**
```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent();
const tools = await agent.listTools();
console.log(tools);
```

**Python:**
```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent()
    tools = await agent.list_tools()
    print(tools)

asyncio.run(main())
```

### Executing Tools

**JavaScript:**
```javascript
const result = await agent.executeTool('storeMemory', {
  key: 'test',
  value: { data: 'value' },
  metadata: {}
});
```

**Python:**
```python
result = await agent.execute_tool('storeMemory', {
    'key': 'test',
    'value': {'data': 'value'},
    'metadata': {}
})
```

### Memory Operations

**JavaScript:**
```javascript
await agent.executeTool('storeMemory', {
  key: 'experiment_1',
  value: { mse: 0.15 },
  metadata: { type: 'test' }
});

const result = await agent.executeTool('retrieveMemory', {
  key: 'experiment_1'
});
```

**Python:**
```python
await agent.execute_tool('storeMemory', {
    'key': 'experiment_1',
    'value': {'mse': 0.15},
    'metadata': {'type': 'test'}
})

result = await agent.execute_tool('retrieveMemory', {
    'key': 'experiment_1'
})
```

### Binance Data Download

**JavaScript:**
```javascript
await agent.executeTool('downloadBinancePriceHistory', {
  symbol: 'BTCUSDT',
  interval: '1h',
  limit: 1000,
  outputFile: 'btc_data.csv'
});
```

**Python:**
```python
await agent.execute_tool('downloadBinancePriceHistory', {
    'symbol': 'BTCUSDT',
    'interval': '1h',
    'limit': 1000,
    'outputFile': 'btc_data.csv'
})
```

### ML Pipeline Generation

**JavaScript:**
```javascript
const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);

const result = await agent.executeTool('generateMLPipeline', {
  existingCode: null,
  prompt: 'Create a CatBoost pipeline'
});
```

**Python:**
```python
import os
agent = ObscureXAgent(api_key=os.environ.get('GOOGLE_API_KEY'))

result = await agent.execute_tool('generateMLPipeline', {
    'existingCode': None,
    'prompt': 'Create a CatBoost pipeline'
})
```

## Method Name Changes

| JavaScript | Python | Notes |
|------------|--------|-------|
| `executeTool()` | `execute_tool()` | Snake case |
| `listTools()` | `list_tools()` | Snake case |
| `runOptimizationLoop()` | `run_optimization_loop()` | Snake case |
| `aiService` | `ai_service` | Snake case attribute |
| `sessionId` | `session_id` | Snake case attribute |

## Tool Names

Tool names remain the same in both versions:
- `storeMemory`, `retrieveMemory`, `searchMemory`
- `storeLongTermMemory`, `retrieveLongTermMemory`, `searchLongTermMemory`
- `addTechnicalIndicator`, `listTechnicalIndicators`, `removeTechnicalIndicator`
- `generateMLPipeline`, `testMLPipeline`
- `listPythonModules`, `installPythonModule`
- `downloadBinancePriceHistory`, `analyzeBinanceData`
- `calculateCryptoIndicators`
- `analyzeContext`, `getExecutionOptions`, `recommendOptimizationStrategy`, `executeAutonomousDecision`

## Command Line Interface

**JavaScript:**
```bash
node agent.js list-tools
node agent.js optimize data.csv 0.05 30
```

**Python:**
```bash
python3 -m obscurex.agent list-tools
python3 -m obscurex.agent optimize --data-file data.csv --threshold 0.05 --max-iterations 30
```

## Testing

**JavaScript:**
```bash
npm test
# or
node test_validation.js
```

**Python:**
```bash
python3 test_validation.py
```

## Complete Example Migration

### JavaScript Version

```javascript
import ObscureXAgent from './agent.js';

async function main() {
  const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);
  
  // Download data
  await agent.executeTool('downloadBinancePriceHistory', {
    symbol: 'BTCUSDT',
    interval: '1h',
    limit: 500,
    outputFile: 'data.csv'
  });
  
  // Add indicators
  await agent.executeTool('addTechnicalIndicator', {
    filename: 'data.csv',
    indicatorName: 'SMA_20'
  });
  
  // Store in memory
  await agent.executeTool('storeMemory', {
    key: 'data_file',
    value: 'data.csv',
    metadata: {}
  });
  
  console.log('Complete!');
}

main();
```

### Python Version

```python
import asyncio
import os
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent(api_key=os.environ.get('GOOGLE_API_KEY'))
    
    # Download data
    await agent.execute_tool('downloadBinancePriceHistory', {
        'symbol': 'BTCUSDT',
        'interval': '1h',
        'limit': 500,
        'outputFile': 'data.csv'
    })
    
    # Add indicators
    await agent.execute_tool('addTechnicalIndicator', {
        'filename': 'data.csv',
        'indicatorName': 'SMA_20'
    })
    
    # Store in memory
    await agent.execute_tool('storeMemory', {
        'key': 'data_file',
        'value': 'data.csv',
        'metadata': {}
    })
    
    print('Complete!')

asyncio.run(main())
```

## Tips for Migration

1. **Naming**: Convert camelCase to snake_case for Python
2. **Async**: Always wrap async calls in `async def` functions and use `asyncio.run()`
3. **Dictionaries**: Use single quotes for strings in Python by convention
4. **None**: Use `None` instead of `null`
5. **Boolean**: Use `True`/`False` instead of `true`/`false`
6. **Imports**: Use Python package imports instead of ES6 imports

## Performance

Both versions offer similar performance:
- JavaScript: V8 engine, event loop
- Python: asyncio event loop, native extensions

For I/O-bound operations (most agent tasks), performance is comparable.

## Support

For questions or issues:
1. Check README_PYTHON.md for Python-specific docs
2. Refer to this migration guide
3. Original JavaScript docs apply for concepts

## Summary

The Python version maintains full feature parity with JavaScript while following Python conventions. The main differences are syntactic - the core functionality and tool system remain identical.
