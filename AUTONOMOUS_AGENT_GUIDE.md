# Autonomous AI Agent - Quick Start Guide

## What's New in v3.0

ObscureX now features a **fully autonomous AI agent** that makes all decisions independently based on context and memory. No human intervention required after initialization!

### Key Features

🤖 **Fully Autonomous** - AI makes all decisions from start to finish
🧠 **Memory-Based Learning** - Learns from past attempts and successes
📊 **MSE-Driven** - Adapts strategies based on performance trends
🎯 **One AI Request Per Situation** - Efficient decision-making with full context
🔄 **Self-Optimizing** - Continuously improves decision quality

## Quick Start

### 1. Installation

```bash
git clone https://github.com/devtomas22/obscureX.git
cd obscureX
pip install -r requirements.txt
```

### 2. Set API Key

```bash
export GOOGLE_API_KEY='your-api-key-here'
```

Get your key at: https://aistudio.google.com/apikey

### 3. Run Examples

```bash
# Run examples demonstrating autonomous features
python3 examples.py

# Run validation tests
python3 test_validation.py

# Parameters in code:
# - data.csv: Your CSV data file (Binance format)
# - 0.05: Target MSE threshold
# - 30: Maximum iterations
```

## How It Works

### Autonomous Decision Flow

Each iteration, the AI:

1. **Analyzes Context** - Examines current state, MSE history, memory
2. **Discovers Options** - Identifies available actions for current phase
3. **Selects Strategy** - Recommends optimization approach based on trends
4. **Executes Action** - Runs chosen action using appropriate tools
5. **Learns** - Stores results in memory for future decisions
6. **Iterates** - Continues until objective achieved

### What the AI Decides

✓ Which optimization strategy to apply
✓ When to tune hyperparameters
✓ When to add feature engineering
✓ When to try different models
✓ When to apply ensemble methods
✓ When objective is achieved

## Available Tools (20 Total)

### Autonomy Tools (NEW)
- **analyzeContext** - AI analyzes context and decides next action
- **getExecutionOptions** - Discovers available execution paths
- **recommendOptimizationStrategy** - MSE-driven strategy recommendations
- **executeAutonomousDecision** - Complete autonomous decision cycle

### Existing Tools
- **Binance & Crypto** (3 tools) - Download data, analyze, calculate indicators
- **CSV Operations** (3 tools) - List, add, remove indicators
- **ML Pipeline** (4 tools) - Generate, test, manage Python modules
- **Memory** (6 tools) - Store, retrieve, search (short-term & long-term)

## Example: Programmatic Usage

```python
import asyncio
import os
from obscurex import ObscureXAgent

async def main():
    # Create agent with API key
    agent = ObscureXAgent(api_key=os.environ.get('GOOGLE_API_KEY'))
    
    # Use autonomous decision-making tools
    result = await agent.execute_tool('executeAutonomousDecision', {
        'currentState': {
            'phase': 'optimization',
            'iteration': 5,
            'mse': 0.15,
            'threshold': 0.05,
            'mseHistory': [0.25, 0.22, 0.20, 0.18, 0.15]
        },
        'objective': 'Optimize ML pipeline for cryptocurrency price prediction',
        'dataFile': 'binance_btcusdt_1h.csv',
        'aiService': agent.ai_service
    })
    
    print('Autonomous decision executed:', result)

asyncio.run(main())

console.log('Objective achieved:', result.objectiveAchieved);
console.log('Best MSE:', result.bestMSE);
console.log('Iterations:', result.iterations);
```

## Run Demos

```bash
# Demo autonomous decision-making tools
npm run autonomous-demo

# Demo with examples and explanations
node autonomous_examples.js

# Traditional orchestrator demo
npm run demo
```

## Autonomous vs Traditional

| Feature | Traditional | Autonomous |
|---------|------------|------------|
| Decision Making | Human-guided | AI-driven |
| Strategy Selection | Fixed sequence | Dynamic adaptation |
| Learning | Limited | Memory-based |
| Optimization Flow | Predictable | Self-adjusting |
| Intervention | Required | Zero |

## Memory-Based Learning

The agent uses dual-layer memory:

**Short-Term Memory** (agent_memory.json)
- Current session iterations
- Recent experiments
- Temporary data

**Long-Term Memory** (agent_longterm_memory.json)
- Best models across sessions
- Successful strategies
- Historical learnings

The AI consults both before every decision!

## What Gets Optimized

The autonomous agent can optimize:
- Model hyperparameters
- Feature engineering approaches
- Ensemble methods
- Cross-validation strategies
- Model architecture
- Preprocessing techniques

All based on MSE trends and memory!

## Tips for Best Results

1. **Start with clean data** - Use Binance format CSV
2. **Set realistic thresholds** - MSE < 0.1 is ambitious
3. **Allow enough iterations** - 30-50 recommended
4. **Let it learn** - Agent improves with memory
5. **Check memory files** - See what AI learned

## Troubleshooting

**"AI API key not available"**
- Set GOOGLE_API_KEY environment variable

**"No data file found"**
- Provide valid CSV file as first argument

**"MSE not extracted"**
- Ensure numpy, pandas, scikit-learn installed

**Agent not improving**
- Check memory files for learnings
- Try longer iteration limit
- Verify data quality

## Advanced Usage

### Use Individual Autonomy Tools

```javascript
const agent = new ObscureXAgent(process.env.GOOGLE_API_KEY);

// Get execution options
const options = await agent.executeTool('getExecutionOptions', {
  currentPhase: 'optimization',
  currentState: { mse: 0.15, threshold: 0.1 }
});

// Get strategy recommendation
const strategy = await agent.executeTool('recommendOptimizationStrategy', {
  mseHistory: [0.25, 0.22, 0.20, 0.18, 0.15],
  currentMSE: 0.15,
  targetMSE: 0.1,
  iterationNumber: 5
});

// Analyze context for decision
const decision = await agent.executeTool('analyzeContext', {
  currentState: { phase: 'optimization', mse: 0.15 },
  objective: 'Achieve MSE < 0.1'
});
```

## Learn More

- **README.md** - Complete feature documentation
- **FEATURES.md** - Detailed technical specifications
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **autonomous_examples.js** - Working code examples
- **autonomous_demo.js** - Interactive demonstrations

## Support

For issues or questions:
1. Check documentation files
2. Run demo scripts
3. Review memory files for AI learnings
4. Verify API key and data format

## What Makes It Autonomous?

✅ AI makes **all** decisions without human input
✅ Learns from **memory** to improve over time
✅ Adapts **strategies** based on results
✅ Discovers **execution options** dynamically
✅ Makes **one AI request** per situation with full context
✅ Achieves objectives with **zero intervention**

Welcome to truly autonomous AI-driven ML optimization! 🚀
