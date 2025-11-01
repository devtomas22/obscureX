# ObscureX AI Agent

A self-contained AI agent with orchestrator, memory management, and ML pipeline optimization. Uses Anthropic's Claude AI for intelligent code generation and optimization.

## Features

### 13 Built-in Tools

**CSV & Technical Indicators:**
1. **List Technical Indicators** - List all technical indicators in a CSV file
2. **Add Technical Indicator** - Add a new technical indicator column to a CSV
3. **Remove Technical Indicator** - Remove a technical indicator from a CSV

**ML Pipeline Management:**
4. **Test ML Pipeline** - Execute a Python ML pipeline and return MSE value
5. **Generate ML Pipeline** - Create ML pipeline code using CatBoost and/or Neural Networks (AI-powered)
6. **List Python Modules** - List all installed Python packages
7. **Install Python Module** - Install a Python package using pip

**Memory Management:**
8. **Store Memory** - Store information in short-term memory (session-based)
9. **Retrieve Memory** - Retrieve information from short-term memory
10. **Search Memory** - Search through short-term memory
11. **Store Long-Term Memory** - Store information persistently across sessions
12. **Retrieve Long-Term Memory** - Retrieve information from long-term memory
13. **Search Long-Term Memory** - Search through long-term memory

### Orchestrator

The agent includes an intelligent orchestrator that:
- Runs optimization loops automatically
- Generates and tests ML pipelines iteratively
- Uses AI to determine optimization strategies
- Stores results in memory (short-term and long-term)
- Continues until MSE threshold is met or max iterations reached
- Learns from previous attempts

## Installation

```bash
git clone https://github.com/devtomas22/obscureX.git
cd obscureX
npm install
```

## Setup

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

Or pass it when creating the agent:

```javascript
const agent = new ObscureXAgent('your-api-key-here');
```

## Usage

### Command Line Interface

```bash
# List all available tools
node agent.js list-tools

# Run the orchestrator (optimization loop)
node agent.js optimize [dataFile] [threshold] [maxIterations]

# Example: Optimize until MSE < 0.05, max 30 iterations
node agent.js optimize sample_data.csv 0.05 30

# Run memory and orchestrator demos
npm run demo
```

### Programmatic Usage

#### Basic Tool Execution

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent();

// Execute any tool
const result = await agent.executeTool('listTechnicalIndicators', {
  filename: 'data.csv'
});
```

#### Using the Orchestrator

```javascript
import ObscureXAgent from './agent.js';

const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);

// Run optimization loop
const result = await agent.runOptimizationLoop({
  dataFile: 'price_data.csv',
  mseThreshold: 0.05,
  maxIterations: 50,
  initialPrompt: 'Create a price prediction pipeline using CatBoost',
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

### CSV Tools

#### 1. List Technical Indicators
```javascript
await agent.executeTool('listTechnicalIndicators', {
  filename: 'data.csv'
});
// Returns: ['SMA_20', 'RSI_14', 'MACD']
```

#### 2. Add Technical Indicator
```javascript
await agent.executeTool('addTechnicalIndicator', {
  filename: 'data.csv',
  indicatorName: 'SMA_50'
});
```

#### 3. Remove Technical Indicator
```javascript
await agent.executeTool('removeTechnicalIndicator', {
  filename: 'data.csv',
  indicatorName: 'SMA_50'
});
```

### ML Pipeline Tools

#### 4. Test ML Pipeline
```javascript
const pythonCode = `
import numpy as np
from sklearn.metrics import mean_squared_error
y_true = np.array([1, 2, 3])
y_pred = np.array([1.1, 2.1, 3.1])
mse = mean_squared_error(y_true, y_pred)
print(f'MSE: {mse}')
`;

await agent.executeTool('testMLPipeline', { pythonCode });
// Returns: { success: true, mse: 0.01, output: "..." }
```

#### 5. Generate ML Pipeline (AI-Powered)
```javascript
// Create new pipeline
await agent.executeTool('generateMLPipeline', {
  existingCode: null,
  prompt: 'Create a price prediction pipeline using CatBoost with feature engineering'
});

// Optimize existing pipeline
await agent.executeTool('generateMLPipeline', {
  existingCode: existingPipelineCode,
  prompt: 'Add hyperparameter tuning and cross-validation'
});
```

#### 6. List Python Modules
```javascript
await agent.executeTool('listPythonModules', {});
// Returns: ['numpy', 'pandas', 'scikit-learn', ...]
```

#### 7. Install Python Module
```javascript
await agent.executeTool('installPythonModule', {
  moduleName: 'catboost'
});
```

### Memory Tools

#### 8-10. Short-Term Memory
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

See `examples.js` for basic tool usage and `orchestrator_demo.js` for memory and orchestrator examples.

```bash
# Run basic examples
node examples.js

# Run orchestrator demo
npm run demo
```

## Architecture

- **ObscureXAgent Class**: Main agent with all tool implementations
- **Anthropic Integration**: Uses Claude for intelligent code generation
- **Memory System**: Dual-layer (short-term + long-term) JSON storage
- **Orchestrator**: Automated optimization loop with learning
- **Tool Registry**: 13 tools with metadata and execution functions

## Requirements

- Node.js 20.x or higher
- Python 3.x with pip
- Anthropic API key (for AI-powered features)

## API Key

The agent requires an Anthropic API key for AI-powered code generation and optimization. Get your key at: https://console.anthropic.com/

Without an API key, the agent falls back to template-based generation (limited functionality).

## License

ISC License - See LICENSE file for details

## Contributing

This is a demonstration project showcasing AI agent architecture with orchestration and memory management.