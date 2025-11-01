import ObscureXAgent from './agent.js';

/**
 * Demo showcasing autonomous AI decision-making features
 */

async function demoAutonomyTools() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║      ObscureX Autonomous AI Agent - Tools Demo          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);

  // Check if API key is available
  if (!agent.anthropic) {
    console.log('⚠️  ANTHROPIC_API_KEY not set. Running limited demo.\n');
    console.log('To see full AI-powered features, set your API key:');
    console.log('  export ANTHROPIC_API_KEY="your-key-here"\n');
  }

  console.log('=== Demo 1: Get Execution Options ===\n');
  
  // Demo getting execution options
  const currentState = {
    phase: 'optimization',
    iteration: 5,
    mse: 0.15,
    threshold: 0.1
  };

  console.log('Current state:', JSON.stringify(currentState, null, 2));
  console.log('\nGetting available execution options...\n');

  const optionsResult = await agent.executeTool('getExecutionOptions', {
    currentPhase: 'optimization',
    currentState: currentState,
    anthropic: agent.anthropic
  });

  if (optionsResult.success) {
    console.log('✓ Execution Options Retrieved:');
    console.log(`  Phase: ${optionsResult.result.phase}`);
    console.log(`  Available Actions: ${optionsResult.result.options.length}`);
    console.log('\n  Sample Actions:');
    optionsResult.result.options.slice(0, 3).forEach((opt, idx) => {
      console.log(`    ${idx + 1}. ${opt.action}: ${opt.description}`);
    });
    
    if (optionsResult.result.aiRecommendations) {
      console.log('\n  AI Recommendations:');
      optionsResult.result.aiRecommendations.slice(0, 2).forEach((rec, idx) => {
        console.log(`    ${idx + 1}. ${rec.action} - ${rec.reasoning || 'Recommended action'}`);
      });
    }
  } else {
    console.log('✗ Failed to get execution options:', optionsResult.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Demo 2: Optimization Strategy Recommendation
  console.log('=== Demo 2: Recommend Optimization Strategy ===\n');

  const mseHistory = [0.25, 0.22, 0.20, 0.18, 0.15];
  console.log('MSE History:', mseHistory);
  console.log('Current MSE:', 0.15);
  console.log('Target MSE:', 0.1);
  console.log('\nAsking AI for optimization strategy...\n');

  const strategyResult = await agent.executeTool('recommendOptimizationStrategy', {
    mseHistory: mseHistory,
    currentMSE: 0.15,
    targetMSE: 0.1,
    iterationNumber: 5,
    anthropic: agent.anthropic
  });

  if (strategyResult.success) {
    console.log('✓ Strategy Recommendation:');
    const rec = strategyResult.result?.recommendation || {};
    console.log(`  Strategy: ${rec.strategy || 'N/A'}`);
    console.log(`  Technique: ${rec.technique || 'N/A'}`);
    console.log(`  Expected Impact: ${rec.expectedImpact || 'N/A'}`);
    
    if (strategyResult.result.trends) {
      console.log('\n  Trend Analysis:');
      console.log(`    Trend: ${strategyResult.result.trends.trend}`);
      console.log(`    Improving: ${strategyResult.result.trends.improvement}`);
      console.log(`    Stagnant: ${strategyResult.result.trends.stagnant}`);
    }
  } else {
    console.log('✗ Failed to get strategy recommendation:', strategyResult.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Demo 3: Context Analysis
  console.log('=== Demo 3: Analyze Context with AI ===\n');

  // Store some context in memory first
  await agent.executeTool('storeMemory', {
    key: 'iteration_3',
    value: { iteration: 3, mse: 0.20, approach: 'CatBoost baseline' }
  });

  await agent.executeTool('storeMemory', {
    key: 'iteration_4',
    value: { iteration: 4, mse: 0.18, approach: 'Added hyperparameter tuning' }
  });

  await agent.executeTool('storeLongTermMemory', {
    key: 'best_approach_2024',
    value: { technique: 'CatBoost with GridSearchCV', mse: 0.15 }
  });

  console.log('Context stored in memory (short-term and long-term)');
  console.log('\nAsking AI to analyze context and decide next action...\n');

  const contextResult = await agent.executeTool('analyzeContext', {
    currentState: {
      phase: 'optimization',
      iteration: 5,
      mse: 0.15,
      threshold: 0.1
    },
    objective: 'Achieve MSE below 0.1 for cryptocurrency price prediction',
    anthropic: agent.anthropic
  });

  if (contextResult.success) {
    console.log('✓ AI Decision:');
    const decision = contextResult.result.decision;
    console.log(`  Action: ${decision.action}`);
    console.log(`  Reasoning: ${decision.reasoning}`);
    console.log(`  Details: ${decision.details}`);
    console.log(`  Confidence: ${decision.confidence}`);
    
    console.log('\n  Context Used:');
    console.log(`    Short-term entries: ${contextResult.result.contextUsed.shortTermEntries}`);
    console.log(`    Long-term entries: ${contextResult.result.contextUsed.longTermEntries}`);
  } else {
    console.log('✗ Failed to analyze context:', contextResult.error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Demo 4: List all autonomy tools
  console.log('=== Demo 4: Available Autonomy Tools ===\n');

  const allTools = await agent.listTools();
  const autonomyTools = allTools.filter(t => t.category === 'autonomy');

  console.log(`Total tools: ${allTools.length}`);
  console.log(`Autonomy tools: ${autonomyTools.length}\n`);

  autonomyTools.forEach((tool, idx) => {
    console.log(`${idx + 1}. ${tool.name}`);
    console.log(`   Description: ${tool.description}`);
    console.log();
  });

  console.log('='.repeat(60) + '\n');

  console.log('✅ Demo Complete!\n');
  console.log('Key Features Demonstrated:');
  console.log('  ✓ AI-powered execution flow decision-making');
  console.log('  ✓ Context-aware optimization strategy recommendations');
  console.log('  ✓ Memory-based decision making (short-term + long-term)');
  console.log('  ✓ Autonomous action planning based on current state\n');

  console.log('To run the full autonomous agent:');
  console.log('  node autonomous_agent.js <dataFile> [threshold] [maxIterations]');
  console.log('\nExample:');
  console.log('  node autonomous_agent.js sample_data.csv 0.05 30\n');
}

async function demoToolIntegration() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         Autonomous Tools Integration Demo               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);

  console.log('This demo shows how autonomy tools integrate with the agent.\n');

  // Show tool count by category
  const tools = await agent.listTools();
  const categories = {};
  
  tools.forEach(tool => {
    if (!categories[tool.category]) {
      categories[tool.category] = [];
    }
    categories[tool.category].push(tool.name);
  });

  console.log('Tools by Category:\n');
  Object.entries(categories).forEach(([category, toolList]) => {
    console.log(`📁 ${category.toUpperCase()} (${toolList.length} tools)`);
    toolList.forEach(name => {
      console.log(`   • ${name}`);
    });
    console.log();
  });

  console.log('='.repeat(60) + '\n');

  console.log('Autonomous Agent Workflow:\n');
  console.log('1. Agent receives objective and data file');
  console.log('2. Agent uses analyzeContext to understand current situation');
  console.log('3. Agent uses getExecutionOptions to see available actions');
  console.log('4. Agent uses recommendOptimizationStrategy for MSE optimization');
  console.log('5. Agent executes chosen action using existing tools');
  console.log('6. Agent stores results in memory for future decisions');
  console.log('7. Repeat until objective achieved or max iterations reached\n');

  console.log('Each iteration makes ONE AI request with full context,');
  console.log('allowing the AI to make informed, autonomous decisions.\n');
}

// Run demos
async function main() {
  try {
    await demoAutonomyTools();
    await demoToolIntegration();
    
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                  All Demos Complete!                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
