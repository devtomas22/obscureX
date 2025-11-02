# ObscureX Agent - Feature Summary

## Overview
An autonomous, self-directed AI agent built in Node.js with modular tool architecture, Binance cryptocurrency integration, **fully autonomous decision-making**, orchestration capabilities, dual-layer memory management, and ML pipeline optimization powered by Google Gemini AI. **Version 3.0 introduces complete autonomy** - the agent makes intelligent decisions based on context and memory, optimizing ML pipelines without human intervention.

## Complete Feature Set

### 20 Modular Tools Implemented (NEW: +4 Autonomy Tools)

#### Binance & Cryptocurrency Analysis (Tools 1-3)
1. **downloadBinancePriceHistory** - Downloads historical crypto price data from Binance API
2. **analyzeBinanceData** - Provides comprehensive statistical analysis (volatility, trends, volume)
3. **calculateCryptoIndicators** - Calculates technical indicators (RSI, MACD, Bollinger Bands, SMA, EMA) **using AI-generated Python code with intelligent caching**

#### CSV & Technical Indicators (Tools 4-6)
4. **listTechnicalIndicators** - Lists technical indicators in CSV files (Binance-aware)
5. **addTechnicalIndicator** - Adds new indicator columns to CSVs
6. **removeTechnicalIndicator** - Removes indicator columns from CSVs

#### ML Pipeline Management (Tools 7-10)
7. **testMLPipeline** - Executes Python pipelines and extracts MSE values (optimized for Binance data)
8. **generateMLPipeline** - **AI-required** pipeline generation with CatBoost/Neural Networks (no template fallback)
9. **listPythonModules** - Lists all installed Python packages
10. **installPythonModule** - Installs Python packages via pip

#### Memory Management (Tools 11-16)
11. **storeMemory** - Stores data in short-term (session) memory
12. **retrieveMemory** - Retrieves data from short-term memory
13. **searchMemory** - Searches through short-term memory
14. **storeLongTermMemory** - Stores data persistently across sessions
15. **retrieveLongTermMemory** - Retrieves data from long-term memory
16. **searchLongTermMemory** - Searches through long-term memory

#### Autonomous Decision-Making (Tools 17-20) 🆕 NEW in v3.0
17. **analyzeContext** - AI analyzes current state, memory, and execution results to decide best next action
18. **getExecutionOptions** - Discovers available execution flow options and recommends actions based on current phase
19. **recommendOptimizationStrategy** - AI-powered MSE trend analysis with adaptive strategy recommendations
20. **executeAutonomousDecision** - Executes complete autonomous decision cycle: analyze, decide, execute, store

### Modular Architecture

**Tool Organization:**
```
tools/
├── binance/          # Binance API integration (1 tool)
│   └── downloadBinancePriceHistory.js
├── analysis/         # Crypto analysis (2 tools)
│   ├── analyzeBinanceData.js
│   └── calculateCryptoIndicators.js
├── csv/              # CSV operations (3 tools)
│   ├── listTechnicalIndicators.js
│   ├── addTechnicalIndicator.js
│   └── removeTechnicalIndicator.js
├── ml/               # ML pipeline management (4 tools)
│   ├── testMLPipeline.js
│   ├── generateMLPipeline.js
│   ├── listPythonModules.js
│   └── installPythonModule.js
├── memory/           # Memory operations (6 tools)
│   ├── storeMemory.js
│   ├── retrieveMemory.js
│   ├── searchMemory.js
│   ├── storeLongTermMemory.js
│   ├── retrieveLongTermMemory.js
│   └── searchLongTermMemory.js
├── autonomy/         # 🆕 Autonomous decision-making (4 tools)
│   ├── analyzeContext.js
│   ├── getExecutionOptions.js
│   ├── recommendOptimizationStrategy.js
│   └── executeAutonomousDecision.js
└── toolLoader.js     # Dynamic tool loading system
```

### Autonomous Decision-Making System 🆕 NEW in v3.0

**Core Capabilities:**
- **AI-Driven Decisions**: Makes one AI request per situation with full context
- **Memory Consultation**: Analyzes short-term and long-term memory for informed decisions
- **Execution Flow Control**: AI determines which tools to use and in what order
- **Adaptive Strategies**: Automatically adjusts optimization approach based on MSE trends
- **Self-Learning**: Learns from failures and successes to improve over time

**Decision-Making Process:**
1. **Context Analysis**: AI examines current state, MSE history, recent activity, and historical knowledge
2. **Option Discovery**: AI identifies available execution paths based on current phase
3. **Strategy Selection**: AI recommends optimization strategy based on performance trends
4. **Autonomous Execution**: AI decides and executes the next action using appropriate tools
5. **Memory Storage**: Results and decisions stored for future learning
6. **Iteration**: Process repeats until objective achieved or max iterations reached

**Execution Phases:**
- **Initialization**: Data preparation, indicator calculation, initial setup
- **Optimization**: Pipeline generation, testing, hyperparameter tuning, feature engineering
- **Evaluation**: Performance assessment, model selection, finalization

**Available Actions (AI-Selected):**
- Continue current optimization strategy
- Add technical indicators for better features
- Apply hyperparameter tuning (GridSearchCV, RandomizedSearchCV)
- Implement feature engineering (polynomial features, interactions)
- Try ensemble methods (voting, stacking)
- Add cross-validation for generalization
- Switch to different model architecture
- Analyze results and decide next step

### Binance Integration

**Supported Features:**
- Direct API access for downloading historical price data
- Support for all major trading pairs (BTCUSDT, ETHUSDT, etc.)
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d, etc.)
- Automatic CSV formatting in Binance structure
- Understanding of Binance CSV columns:
  - timestamp, open, high, low, close, volume
  - close_time, quote_volume, trades
  - taker_buy_volume, taker_buy_quote_volume

**Analysis Capabilities:**
- Price statistics (min, max, average, change %)
- Volume analysis (total, average, min, max)
- Volatility metrics (standard deviation, returns)
- Trend identification (bullish/bearish/neutral)
- Moving average comparisons (SMA20, SMA50)

**Technical Indicators:**
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands (upper, middle, lower)
- SMA (Simple Moving Average)
- EMA (Exponential Moving Average)

### Orchestrator Systems

#### Autonomous Orchestrator 🆕 NEW in v3.0

The fully autonomous orchestrator makes all decisions without human intervention:

**Key Features:**
- **Zero human intervention** - AI makes all decisions from start to finish
- **Context-aware decision-making** - One AI request per iteration with full context
- **Memory-based learning** - Learns from past attempts and successes
- **Adaptive strategies** - Automatically adjusts approach based on MSE trends
- **Dynamic execution flow** - AI determines which tools to use and when
- **Self-optimization** - Continuously improves decision-making over time

**Autonomous Process Flow:**
1. **Initialization**: Agent loads configuration and checks long-term memory for previous best
2. **Context Analysis**: AI analyzes current state, MSE history, and memory
3. **Decision Making**: AI uses analyzeContext to decide next action with reasoning
4. **Option Discovery**: AI queries getExecutionOptions for available actions
5. **Strategy Selection**: AI uses recommendOptimizationStrategy for MSE-driven decisions
6. **Autonomous Execution**: AI executes chosen action using appropriate tools
7. **Result Storage**: Stores decision and results in memory for future learning
8. **Iteration**: Repeats cycle until objective achieved or max iterations reached

**Comparison with Traditional Orchestrator:**
- Traditional: Human defines initial prompt and strategy
- Autonomous: AI defines all prompts and strategies based on context
- Traditional: Fixed optimization sequence
- Autonomous: Dynamic, adaptive optimization sequence
- Traditional: Uses AI for code generation only
- Autonomous: Uses AI for all decision-making + code generation

#### Traditional Orchestrator

The traditional orchestrator provides structured optimization:

**Key Features:**
- Iterative ML pipeline optimization loop
- AI-powered strategy generation using Gemini
- Automatic MSE tracking and comparison
- Best model persistence in long-term memory
- Configurable MSE threshold and iteration limits
- Learning from previous attempts
- Optimized for Binance price data

**Process Flow:**
1. Load previous best from long-term memory (if exists)
2. Generate/optimize pipeline using AI (Binance-aware)
3. Test pipeline and extract MSE
4. Store results in short-term memory
5. Update best if improved and persist to long-term memory
6. Use AI to analyze history and suggest next optimization
7. Repeat until threshold met or max iterations reached

### Memory System Architecture

**Short-Term Memory:**
- File: `agent_memory.json`
- Scope: Current session
- Purpose: Track iterations, experiments, temporary data
- Auto-cleared between major runs

**Long-Term Memory:**
- File: `agent_longterm_memory.json`
- Scope: Persistent across sessions
- Purpose: Store best models, successful approaches, learnings
- Maintains history of changes
- Used to resume optimization from previous best

**Memory Features:**
- JSON-based persistence
- Automatic timestamping
- Session ID tracking
- Metadata support
- History tracking (long-term only)
- Full-text search capability

### AI Integration

**Google Gemini Integration (REQUIRED):**
- Model: `gemini-2.0-flash-exp`
- Used for ALL code generation (technical indicators and ML pipelines)
- **🆕 Used for autonomous decision-making** - analyzes context, decides actions
- **🆕 Used for strategy recommendations** - MSE trend analysis and optimization suggestions
- Analyzes iteration history to suggest improvements
- Generates complete, runnable Python code
- **AI-first approach** - No template fallback for reliability
- **Intelligent caching** - Generated indicator code cached in long-term memory

**AI Decision-Making Features 🆕 NEW:**
- **Context Analysis**: AI examines current state, memory, and execution history
- **Action Selection**: AI chooses best next action from available options
- **Strategy Recommendation**: AI suggests optimization strategies based on MSE trends
- **Reasoning**: AI provides reasoning for each decision for transparency
- **Confidence Levels**: AI indicates confidence in recommendations

**Optimization Strategies Generated by AI:**
- Hyperparameter tuning (GridSearchCV, RandomizedSearchCV)
- Feature engineering (polynomial features, interactions)
- Cross-validation implementation
- Ensemble methods
- Feature selection techniques
- Regularization strategies
- Advanced preprocessing
- **🆕 Adaptive strategies** - AI selects strategy based on current performance

### Command Line Interface

```bash
# List all available tools (now 20 tools)
node agent.js list-tools

# Run the AUTONOMOUS agent 🆕 (v3.0) - AI makes all decisions
node autonomous_agent.js <dataFile> [threshold] [maxIterations]

# Example: Fully autonomous optimization
node autonomous_agent.js binance_btcusdt_1h.csv 0.05 30

# Or use npm scripts
npm run autonomous binance_btcusdt_1h.csv 0.05 30

# Run traditional optimization loop with Binance data
node agent.js optimize [dataFile] [threshold] [maxIterations]

# Example: Traditional optimization
node agent.js optimize binance_btcusdt_1h.csv 0.05 30

# Run demos
npm run demo              # Memory and traditional orchestrator demo
npm run autonomous-demo   # 🆕 Autonomous decision-making demo
```

# Run optimization loop
node agent.js optimize [dataFile] [threshold] [maxIterations]

# Examples
node agent.js optimize data.csv 0.05 30  # Optimize until MSE < 0.05

# Run demos
npm run demo          # Memory and orchestrator demo
npm test             # Run validation tests
```

### Programmatic API

```javascript
import ObscureXAgent from './agent.js';

// Initialize with API key
const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);

// Execute any tool
const result = await agent.executeTool('toolName', params);

// Run orchestrator
const optimizationResult = await agent.runOptimizationLoop({
  dataFile: 'data.csv',
  mseThreshold: 0.05,
  maxIterations: 50
});

// Access memory directly
agent.memory          // Short-term memory object
agent.longTermMemory  // Long-term memory object
```

## File Structure

```
obscureX/
├── agent.js                      # Main agent with dynamic tool loading
├── tools/                        # Modular tool directory
│   ├── binance/                  # Binance integration
│   │   └── downloadBinancePriceHistory.js
│   ├── analysis/                 # Crypto analysis tools
│   │   ├── analyzeBinanceData.js
│   │   └── calculateCryptoIndicators.js
│   ├── csv/                      # CSV operations
│   │   ├── listTechnicalIndicators.js
│   │   ├── addTechnicalIndicator.js
│   │   └── removeTechnicalIndicator.js
│   ├── ml/                       # ML pipeline tools
│   │   ├── testMLPipeline.js
│   │   ├── generateMLPipeline.js
│   │   ├── listPythonModules.js
│   │   └── installPythonModule.js
│   ├── memory/                   # Memory operations
│   │   ├── storeMemory.js
│   │   ├── retrieveMemory.js
│   │   ├── searchMemory.js
│   │   ├── storeLongTermMemory.js
│   │   ├── retrieveLongTermMemory.js
│   │   └── searchLongTermMemory.js
│   └── toolLoader.js             # Dynamic tool loader
├── examples.js                   # Basic tool usage examples
├── orchestrator_demo.js          # Memory and orchestrator demos
├── binance_example.js            # Binance integration example
├── test_validation.js            # Comprehensive test suite
├── sample_binance_data.csv       # Sample data for testing
├── package.json                  # Project configuration
├── .gitignore                    # Excludes memory files, generated code
├── README.md                     # Full documentation
├── FEATURES.md                   # This file
├── agent_memory.json            # Short-term memory (gitignored)
└── agent_longterm_memory.json   # Long-term memory (gitignored)
```

## Testing

**Validation Suite:** 6+ comprehensive tests
- ✓ Tool availability (20 tools including autonomy)
- ✓ CSV operations (add, list, remove)
- ✓ Short-term memory (store, retrieve, search)
- ✓ Long-term memory (store, retrieve, search)
- ✓ Python module operations
- ✓ ML pipeline generation (Binance-optimized)
- ✓ ML pipeline testing with MSE extraction
- 🆕 Autonomous tools (context analysis, execution options, strategy recommendations)

All core tests passing with 100% success rate.

**Examples:**
- `examples.js` - Basic tool usage examples
- `orchestrator_demo.js` - Memory and traditional orchestrator demos
- `binance_example.js` - Comprehensive Binance integration demo
- 🆕 `autonomous_demo.js` - Autonomous decision-making features demo
- 🆕 `autonomous_agent.js` - Fully autonomous agent CLI

## Dependencies

**Node.js Packages:**
- `@google/generative-ai` (^0.21.0) - Only external dependency

**Python Requirements:**
- Python 3.x
- pip
- numpy, pandas, scikit-learn (for ML pipelines)
- Optional: catboost, tensorflow/pytorch for generated pipelines

## Key Design Decisions

1. **Modular Architecture**: Tools separated into category-based directories
2. **Dynamic Loading**: Tools loaded at runtime for extensibility
3. **Binance-First**: All CSV tools understand Binance data format
4. **No Agent Framework**: Built from scratch with only Google Generative AI SDK dependency
5. **Dual Memory**: Separate short-term and long-term for different use cases
6. **JSON Persistence**: Simple, human-readable storage format
7. **AI-First**: Leverage Gemini for ALL code generation (required)
8. **Intelligent Caching**: Generated indicator code cached in long-term memory
9. **Python Execution**: All generated code runs via child_process
10. **CLI + API**: Both command-line and programmatic interfaces
11. **Comprehensive Logging**: Verbose output for transparency
12. 🆕 **Autonomous Decision-Making**: AI makes all decisions based on context and memory
13. 🆕 **One AI Request per Situation**: Efficient decision-making with full context
14. 🆕 **Self-Learning System**: Agent learns from successes and failures

## Use Cases

1. **Cryptocurrency Price Prediction**: Download Binance data and train ML models
2. **Technical Analysis**: Calculate and analyze crypto indicators
3. **Automated ML Optimization**: Continuous improvement of prediction models
4. 🆕 **Fully Autonomous Optimization**: Zero-touch ML pipeline optimization with AI decisions
5. **Memory-Augmented Workflows**: Tools that remember context across sessions
6. **Crypto Data Management**: Quick technical indicator manipulation
7. **Python Environment Management**: Module installation and tracking
8. **Code Generation**: AI-powered ML pipeline creation for crypto data
9. **Trading Research**: Track experiments in structured memory
10. 🆕 **Self-Directed Research**: AI explores optimization strategies autonomously

## Future Enhancements (Not Implemented)

- Multi-exchange support (Coinbase, Kraken, etc.)
- Real-time data streaming
- Backtesting framework
- Multi-objective optimization (MSE + Sharpe ratio, etc.)
- Parallel pipeline testing
- Visualization of optimization progress and price charts
- Export memory to different formats
- Memory compression/archival
- Distributed orchestration
- More sophisticated learning from history
- Portfolio optimization tools
- Multi-agent collaboration
- Reinforcement learning for decision optimization

## Conclusion

ObscureX v3.0 is a production-ready autonomous AI agent demonstrating:
- 🆕 **Fully autonomous decision-making** - AI controls the entire optimization process
- 🆕 **Context-aware AI requests** - One AI call per situation with complete context
- 🆕 **Memory-based learning** - Agent learns from history to improve decisions
- 🆕 **Dynamic execution flow** - AI determines tool usage and sequencing
- Modular, extensible architecture (20 tools in 6 categories)
- Binance cryptocurrency integration
- Advanced technical analysis capabilities
- Dual orchestration modes (autonomous + traditional)
- Intelligent memory management
- **AI-first code generation** (required for all Python code)
- **Smart caching system** for performance optimization
- Python code execution via child_process
- Robust tool execution
- Comprehensive testing

The agent successfully implements a fully autonomous ML optimization system where the AI makes all decisions, consults memory for learning, discovers execution options dynamically, and adapts optimization strategies based on performance trends - all with minimal human intervention.
