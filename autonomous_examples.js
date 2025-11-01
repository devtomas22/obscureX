#!/usr/bin/env node

/**
 * Example: Autonomous Agent Usage
 * Demonstrates how to use the new autonomous decision-making features
 */

import ObscureXAgent from './agent.js';
import { AutonomousOrchestrator } from './autonomous_agent.js';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║    ObscureX Autonomous Agent - Usage Examples         ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Example 1: Basic Autonomous Tool Usage
async function example1_BasicAutonomyTools() {
  console.log('=== Example 1: Using Individual Autonomy Tools ===\n');
  
  const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);

  // 1. Get execution options
  console.log('1. Getting execution options for optimization phase...');
  const options = await agent.executeTool('getExecutionOptions', {
    currentPhase: 'optimization',
    currentState: { 
      mse: 0.15, 
      threshold: 0.1,
      iteration: 5
    }
  });

  if (options.success) {
    console.log(`   Available actions: ${options.result.options.length}`);
    console.log(`   Phase: ${options.result.phase}`);
    console.log(`   Sample actions: ${options.result.options.slice(0, 3).map(o => o.action).join(', ')}\n`);
  }

  // 2. Recommend optimization strategy (fallback without API)
  console.log('2. Getting optimization strategy recommendation...');
  const strategy = await agent.executeTool('recommendOptimizationStrategy', {
    mseHistory: [0.25, 0.22, 0.20, 0.18, 0.15],
    currentMSE: 0.15,
    targetMSE: 0.1,
    iterationNumber: 5
  });

  if (strategy.success) {
    console.log(`   Recommendation: ${strategy.result.recommendation?.strategy || 'Fallback strategy'}`);
    console.log(`   Trend: ${strategy.result.trends?.trend || 'improving'}`);
    console.log(`   Improving: ${strategy.result.trends?.improvement}\n`);
  }

  console.log('✓ Individual autonomy tools demonstrated\n');
}

// Example 2: Full Autonomous Agent (requires data file and API key)
async function example2_FullAutonomousAgent() {
  console.log('=== Example 2: Full Autonomous Agent ===\n');
  
  console.log('The autonomous agent makes ALL decisions:');
  console.log('• Analyzes current context and memory');
  console.log('• Decides next action based on MSE trends');
  console.log('• Executes chosen action autonomously');
  console.log('• Learns from results and adjusts strategy\n');

  console.log('To run the full autonomous agent:');
  console.log('  export ANTHROPIC_API_KEY="your-key"');
  console.log('  node autonomous_agent.js data.csv 0.05 30\n');
  
  console.log('Or programmatically:');
  console.log(`
  import { AutonomousOrchestrator } from './autonomous_agent.js';
  import ObscureXAgent from './agent.js';
  
  const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);
  const orchestrator = new AutonomousOrchestrator(agent);
  
  const result = await orchestrator.runAutonomous({
    dataFile: 'binance_data.csv',
    objective: 'Optimize ML pipeline to achieve lowest MSE',
    mseThreshold: 0.05,
    maxIterations: 30,
    verbose: true
  });
  
  console.log('Success:', result.objectiveAchieved);
  console.log('Best MSE:', result.bestMSE);
  `);
  
  console.log('✓ Full autonomous agent usage explained\n');
}

// Example 3: Decision-Making Workflow
async function example3_DecisionMakingWorkflow() {
  console.log('=== Example 3: Autonomous Decision-Making Workflow ===\n');
  
  console.log('Each iteration follows this workflow:\n');
  
  console.log('1. CONTEXT ANALYSIS');
  console.log('   • Load current state (phase, MSE, iteration)');
  console.log('   • Read short-term memory (last 10 entries)');
  console.log('   • Read long-term memory (best results)');
  console.log('   • AI analyzes all context → decides next action\n');

  console.log('2. OPTION DISCOVERY');
  console.log('   • Query available actions for current phase');
  console.log('   • Get AI recommendations on priority');
  console.log('   • Understand tool requirements and prerequisites\n');

  console.log('3. STRATEGY SELECTION');
  console.log('   • Analyze MSE history for trends');
  console.log('   • AI recommends optimization strategy');
  console.log('   • Provides reasoning and expected impact\n');

  console.log('4. EXECUTION');
  console.log('   • Execute chosen action using appropriate tools');
  console.log('   • Generate/optimize ML pipeline code');
  console.log('   • Test pipeline and extract MSE\n');

  console.log('5. LEARNING');
  console.log('   • Store decision and results in memory');
  console.log('   • Update best model if improved');
  console.log('   • Prepare for next iteration\n');

  console.log('✓ Decision-making workflow explained\n');
}

// Example 4: Comparison with Traditional Orchestrator
async function example4_ComparisonWithTraditional() {
  console.log('=== Example 4: Autonomous vs Traditional Orchestrator ===\n');
  
  console.log('TRADITIONAL ORCHESTRATOR:');
  console.log('• Human defines initial prompt');
  console.log('• Fixed optimization sequence');
  console.log('• AI generates code only');
  console.log('• Predictable execution flow\n');

  console.log('AUTONOMOUS ORCHESTRATOR (NEW):');
  console.log('• AI defines all prompts and strategies');
  console.log('• Dynamic, adaptive optimization sequence');
  console.log('• AI makes all decisions + generates code');
  console.log('• Self-learning execution flow\n');

  console.log('KEY BENEFITS OF AUTONOMOUS MODE:');
  console.log('✓ Zero human intervention required');
  console.log('✓ Adapts strategy based on MSE trends');
  console.log('✓ Learns from past attempts');
  console.log('✓ Makes context-aware decisions');
  console.log('✓ One AI request per situation (efficient)\n');
  
  console.log('✓ Comparison complete\n');
}

// Example 5: Memory-Based Learning
async function example5_MemoryBasedLearning() {
  console.log('=== Example 5: Memory-Based Learning ===\n');
  
  const agent = new ObscureXAgent();

  console.log('The autonomous agent uses dual-layer memory:\n');

  console.log('SHORT-TERM MEMORY (Current Session):');
  await agent.executeTool('storeMemory', {
    key: 'iteration_5',
    value: { 
      mse: 0.15, 
      strategy: 'hyperparameter_tuning',
      result: 'improved' 
    }
  });
  console.log('• Stores: Recent iterations, current experiments');
  console.log('• Used for: Understanding recent trends');
  console.log('• Example: Last 10 iterations with MSE values\n');

  console.log('LONG-TERM MEMORY (Persistent):');
  await agent.executeTool('storeLongTermMemory', {
    key: 'best_approach',
    value: { 
      technique: 'CatBoost + GridSearchCV',
      mse: 0.05,
      notes: 'Works best with 5-fold cross-validation'
    }
  });
  console.log('• Stores: Best models, successful strategies');
  console.log('• Used for: Learning from past successes');
  console.log('• Example: Best performing pipeline configurations\n');

  console.log('HOW AI USES MEMORY:');
  console.log('1. Reads memory before making decisions');
  console.log('2. Identifies patterns in successful attempts');
  console.log('3. Avoids repeating failed strategies');
  console.log('4. Builds upon previous best results');
  console.log('5. Continuously improves decision quality\n');

  console.log('✓ Memory-based learning explained\n');
}

// Run all examples
async function main() {
  try {
    await example1_BasicAutonomyTools();
    await example2_FullAutonomousAgent();
    await example3_DecisionMakingWorkflow();
    await example4_ComparisonWithTraditional();
    await example5_MemoryBasedLearning();
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              All Examples Complete!                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('Next Steps:');
    console.log('1. Set ANTHROPIC_API_KEY environment variable');
    console.log('2. Prepare a CSV data file (or download from Binance)');
    console.log('3. Run: node autonomous_agent.js data.csv 0.05 30');
    console.log('4. Watch the AI make autonomous decisions!\n');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
