# ObscureX AI Agent - Python Version

A complete Python implementation of the ObscureX AI Agent with modular tools for cryptocurrency analysis, ML pipeline optimization, and Binance data integration.

## Features

- **20 Modular Tools** organized in 6 categories
- **Google Gemini AI Integration** for code generation and autonomous decision-making
- **Async/await support** for efficient I/O operations
- **Memory Management** with short-term and long-term persistence
- **Binance Integration** for cryptocurrency data
- **ML Pipeline** generation and testing
- **Technical Indicators** calculation

## Installation

### From Source

```bash
git clone https://github.com/devtomas22/obscureX.git
cd obscureX
pip install -r requirements.txt
```

### Using setup.py

```bash
git clone https://github.com/devtomas22/obscureX.git
cd obscureX
pip install -e .
```

## Quick Start

### Python API

```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    # Create agent
    agent = ObscureXAgent()
    
    # List all tools
    tools = await agent.list_tools()
    print(f"Available tools: {len(tools)}")
    
    # Use memory
    await agent.execute_tool('storeMemory', {
        'key': 'my_key',
        'value': {'data': 'example'},
        'metadata': {}
    })
    
    result = await agent.execute_tool('retrieveMemory', {
        'key': 'my_key'
    })
    print(f"Retrieved: {result['result']['value']}")

asyncio.run(main())
```

### Command Line

```bash
# List all tools
python3 -m obscurex.agent list-tools

# Run optimization (requires data file)
python3 -m obscurex.agent optimize --data-file data.csv --threshold 0.05
```

### Examples

```bash
# Run examples
python3 examples.py

# Run tests
python3 test_validation.py
```

## Setup Google Gemini API

The agent requires a Google Gemini API key for AI-powered features:

```bash
export GOOGLE_API_KEY='your-api-key'
# or
export GEMINI_API_KEY='your-api-key'
```

Get your key at: https://aistudio.google.com/apikey

## Available Tools

### Memory Tools (6 tools)
- `storeMemory` - Store in short-term memory
- `retrieveMemory` - Retrieve from short-term memory
- `searchMemory` - Search short-term memory
- `storeLongTermMemory` - Store in long-term memory (persistent)
- `retrieveLongTermMemory` - Retrieve from long-term memory
- `searchLongTermMemory` - Search long-term memory

### CSV Tools (3 tools)
- `listTechnicalIndicators` - List indicators in CSV
- `addTechnicalIndicator` - Add indicator column
- `removeTechnicalIndicator` - Remove indicator column

### ML Tools (4 tools)
- `generateMLPipeline` - Generate Python ML code with AI
- `testMLPipeline` - Execute and test ML pipeline
- `listPythonModules` - List installed packages
- `installPythonModule` - Install Python package

### Binance Tools (1 tool)
- `downloadBinancePriceHistory` - Download crypto price data

### Analysis Tools (2 tools)
- `analyzeBinanceData` - Analyze price data statistics
- `calculateCryptoIndicators` - Calculate technical indicators

### Autonomy Tools (4 tools)
- `analyzeContext` - AI-powered context analysis
- `getExecutionOptions` - Get available actions
- `recommendOptimizationStrategy` - Recommend optimization approach
- `executeAutonomousDecision` - Execute autonomous decision cycle

## Example Usage

### Download Binance Data

```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent()
    
    result = await agent.execute_tool('downloadBinancePriceHistory', {
        'symbol': 'BTCUSDT',
        'interval': '1h',
        'limit': 1000,
        'outputFile': 'btc_data.csv'
    })
    
    print(f"Downloaded {result['result']['records']} records")

asyncio.run(main())
```

### Generate and Test ML Pipeline

```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent(api_key='your-google-api-key')
    
    # Generate pipeline
    result = await agent.execute_tool('generateMLPipeline', {
        'existingCode': None,
        'prompt': 'Create a CatBoost pipeline for BTC price prediction'
    })
    
    code = result['result']['code']
    
    # Test the pipeline
    test_result = await agent.execute_tool('testMLPipeline', {
        'pythonCode': code
    })
    
    print(f"MSE: {test_result['result']['mse']}")

asyncio.run(main())
```

### Memory Management

```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent()
    
    # Store
    await agent.execute_tool('storeLongTermMemory', {
        'key': 'best_model',
        'value': {'mse': 0.05, 'algorithm': 'CatBoost'},
        'metadata': {'date': '2024-01-01'}
    })
    
    # Retrieve
    result = await agent.execute_tool('retrieveLongTermMemory', {
        'key': 'best_model'
    })
    
    print(f"Best model: {result['result']['value']}")

asyncio.run(main())
```

## Architecture

```
obscurex/
├── __init__.py          # Package initialization
├── agent.py             # Main agent class
├── services/
│   ├── __init__.py
│   └── ai_service.py    # Google Gemini integration
└── tools/
    ├── __init__.py
    ├── tool_loader.py   # Dynamic tool loader
    ├── memory/          # 6 memory tools
    ├── csv/             # 3 CSV tools
    ├── ml/              # 4 ML tools
    ├── binance/         # 1 Binance tool
    ├── analysis/        # 2 analysis tools
    └── autonomy/        # 4 autonomy tools
```

## Requirements

- Python 3.8+
- google-generativeai >= 0.3.0
- requests >= 2.31.0
- pandas >= 2.0.0
- numpy >= 1.24.0

## Testing

```bash
# Run all tests
python3 test_validation.py

# Run examples
python3 examples.py
```

## Differences from JavaScript Version

1. **Async/await**: Full Python async/await support using `asyncio`
2. **Type hints**: Python type hints for better code clarity
3. **Package structure**: Standard Python package with `setup.py`
4. **Dependencies**: Python packages instead of npm packages
5. **Tool organization**: Same modular structure, Python modules instead of JS
6. **API compatibility**: Same tool names and parameters

## Migration from JavaScript

If you have existing JavaScript code:

**JavaScript:**
```javascript
const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);
const result = await agent.executeTool('listTechnicalIndicators', { filename: 'data.csv' });
```

**Python:**
```python
import asyncio
from obscurex import ObscureXAgent

async def main():
    agent = ObscureXAgent(api_key=os.environ.get('GOOGLE_API_KEY'))
    result = await agent.execute_tool('listTechnicalIndicators', {'filename': 'data.csv'})

asyncio.run(main())
```

## License

ISC License

## Contributing

This is a demonstration project showcasing AI agent architecture with orchestration and memory management.
