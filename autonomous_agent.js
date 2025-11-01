#!/usr/bin/env node

import ObscureXAgent from './agent.js';

/**
 * Autonomous AI Agent Orchestrator
 * Makes one AI decision per situation, consulting memory to decide next steps
 */

class AutonomousOrchestrator {
  constructor(agent) {
    this.agent = agent;
  }

  /**
   * Run fully autonomous optimization
   * The AI makes all decisions based on context and memory
   */
  async runAutonomous(config) {
    const {
      dataFile = null,
      objective = 'Optimize ML pipeline for cryptocurrency price prediction to achieve lowest MSE',
      mseThreshold = 0.1,
      maxIterations = 50,
      verbose = true
    } = config;

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║       AUTONOMOUS AI AGENT - SELF-DIRECTED MODE        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Objective: ${objective}`);
    console.log(`MSE Threshold: ${mseThreshold}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Session ID: ${this.agent.sessionId}\n`);

    let currentState = {
      phase: 'initialization',
      iteration: 0,
      mse: null,
      threshold: mseThreshold,
      targetMSE: mseThreshold,
      mseHistory: [],
      bestMSE: Infinity,
      bestCode: null,
      dataFile: dataFile
    };

    // Store initial configuration
    await this.agent.executeTool('storeMemory', {
      key: 'autonomous_config',
      value: { objective, mseThreshold, maxIterations, dataFile },
      metadata: { type: 'config' }
    });

    // Check for previous best in long-term memory
    const previousBest = await this.agent.executeTool('retrieveLongTermMemory', { 
      key: 'best_pipeline_autonomous' 
    });
    
    if (previousBest.success && previousBest.result.success) {
      console.log('📚 Found previous best pipeline in long-term memory');
      console.log(`   Previous best MSE: ${previousBest.result.value.mse}`);
      currentState.bestMSE = previousBest.result.value.mse;
      currentState.bestCode = previousBest.result.value.code;
      
      if (currentState.bestMSE <= mseThreshold) {
        console.log('   ✓ Previous best already meets threshold!\n');
      }
    }

    // Main autonomous loop
    while (currentState.iteration < maxIterations) {
      currentState.iteration++;
      
      console.log('\n' + '='.repeat(60));
      console.log(`ITERATION ${currentState.iteration}/${maxIterations}`);
      console.log('='.repeat(60));

      try {
        // Make one autonomous decision for this situation
        const decisionResult = await this._makeAutonomousDecision(
          currentState,
          objective
        );

        if (!decisionResult.success) {
          console.error('❌ Decision cycle failed:', decisionResult.error);
          continue;
        }

        // Update state based on decision result
        currentState = this._updateState(currentState, decisionResult);

        // Log current progress
        this._logProgress(currentState, verbose);

        // Check if objective is met
        if (currentState.mse && currentState.mse <= mseThreshold) {
          console.log('\n' + '✓'.repeat(60));
          console.log('🎉 OBJECTIVE ACHIEVED!');
          console.log(`   Final MSE: ${currentState.mse}`);
          console.log(`   Target: ${mseThreshold}`);
          console.log(`   Iterations: ${currentState.iteration}`);
          console.log('✓'.repeat(60) + '\n');
          
          // Store final result
          await this._storeFinalResult(currentState);
          
          return {
            success: true,
            iterations: currentState.iteration,
            finalMSE: currentState.mse,
            bestMSE: currentState.bestMSE,
            objectiveAchieved: true
          };
        }

      } catch (error) {
        console.error(`\n❌ Error in iteration ${currentState.iteration}:`, error.message);
        
        // Store error in memory for AI to learn from
        await this.agent.executeTool('storeMemory', {
          key: `error_iteration_${currentState.iteration}`,
          value: {
            iteration: currentState.iteration,
            error: error.message,
            state: currentState
          },
          metadata: { type: 'error' }
        });
      }

      // Small delay between iterations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('MAX ITERATIONS REACHED');
    console.log('='.repeat(60));
    console.log(`Best MSE achieved: ${currentState.bestMSE}`);
    console.log(`Target MSE: ${mseThreshold}`);
    console.log(`Total iterations: ${maxIterations}\n`);

    await this._storeFinalResult(currentState);

    return {
      success: currentState.bestMSE <= mseThreshold,
      iterations: maxIterations,
      finalMSE: currentState.mse,
      bestMSE: currentState.bestMSE,
      objectiveAchieved: false
    };
  }

  /**
   * Make one autonomous decision using AI and context
   */
  async _makeAutonomousDecision(currentState, objective) {
    console.log('\n🤖 AI is analyzing context and making decision...\n');

    // Use analyzeContext tool to get AI decision
    const contextAnalysis = await this.agent.executeTool('analyzeContext', {
      currentState: currentState,
      objective: objective,
      anthropic: this.agent.anthropic
    });

    if (!contextAnalysis.success) {
      throw new Error('Context analysis failed: ' + contextAnalysis.error);
    }

    const decision = contextAnalysis.result.decision;
    console.log(`📋 Decision: ${decision.action}`);
    console.log(`💭 Reasoning: ${decision.reasoning}`);
    console.log(`📊 Confidence: ${decision.confidence || 'N/A'}\n`);

    // Get execution options for current phase
    const executionOptions = await this.agent.executeTool('getExecutionOptions', {
      currentPhase: currentState.phase,
      currentState: currentState,
      anthropic: this.agent.anthropic
    });

    // verbose is not defined in this scope - remove verbose logging
    if (executionOptions.success && executionOptions.result.options) {
      console.log(`📑 Available options in ${currentState.phase} phase:`);
      executionOptions.result.options.slice(0, 3).forEach((opt, idx) => {
        console.log(`   ${idx + 1}. ${opt.action}: ${opt.description}`);
      });
      console.log();
    }

    // If we're optimizing and have MSE history, get strategy recommendation
    let strategyRecommendation = null;
    if (currentState.phase === 'optimization' && currentState.mseHistory.length > 0) {
      strategyRecommendation = await this.agent.executeTool('recommendOptimizationStrategy', {
        mseHistory: currentState.mseHistory,
        currentMSE: currentState.mse || Infinity,
        targetMSE: currentState.targetMSE,
        iterationNumber: currentState.iteration,
        anthropic: this.agent.anthropic
      });

      if (strategyRecommendation.success) {
        console.log(`🎯 Recommended Strategy: ${strategyRecommendation.result.recommendation.strategy}`);
        console.log(`   Technique: ${strategyRecommendation.result.recommendation.technique}\n`);
      }
    }

    // Execute the decision
    const executionResult = await this._executeDecision(
      decision,
      strategyRecommendation,
      currentState
    );

    return {
      success: true,
      contextAnalysis: contextAnalysis.result,
      executionOptions: executionOptions.result,
      strategyRecommendation: strategyRecommendation?.result,
      executionResult,
      nextState: executionResult.nextState || currentState
    };
  }

  /**
   * Execute a decision made by the AI
   */
  async _executeDecision(decision, strategyRec, currentState) {
    const action = decision.action.toLowerCase();

    console.log(`⚙️  Executing: ${decision.action}...\n`);

    // Determine which phase we should be in
    if (action.includes('init') || currentState.iteration === 1) {
      currentState.phase = 'initialization';
    } else if (action.includes('optim') || action.includes('pipeline') || action.includes('model')) {
      currentState.phase = 'optimization';
    } else if (action.includes('eval') || action.includes('test') || action.includes('final')) {
      currentState.phase = 'evaluation';
    }

    // Execute based on action type
    if (action.includes('optim') || action.includes('pipeline') || action.includes('model') || action.includes('tune')) {
      return await this._executeOptimization(decision, strategyRec, currentState);
    } else if (action.includes('feature') || action.includes('indicator')) {
      return await this._executeFeatureEngineering(currentState);
    } else if (action.includes('data') || action.includes('download')) {
      return await this._executeDataPreparation(currentState);
    } else {
      // Default: continue with optimization
      return await this._executeOptimization(decision, strategyRec, currentState);
    }
  }

  /**
   * Execute optimization action
   */
  async _executeOptimization(decision, strategyRec, currentState) {
    const strategy = strategyRec?.recommendation?.strategy || 'Optimize pipeline';
    const technique = strategyRec?.recommendation?.technique || decision.details || 'General optimization';

    const prompt = `${strategy}: ${technique}`;

    // Generate or optimize pipeline
    const generateResult = await this.agent.executeTool('generateMLPipeline', {
      existingCode: currentState.bestCode,
      prompt: prompt,
      anthropic: this.agent.anthropic
    });

    if (!generateResult.success) {
      return {
        success: false,
        error: generateResult.error,
        nextState: currentState
      };
    }

    const newCode = generateResult.result.code;
    console.log(`   ✓ Pipeline generated: ${generateResult.result.filename}`);

    // Test the pipeline if we have data
    if (currentState.dataFile) {
      let testCode = newCode;
      // Replace placeholders with actual data file
      testCode = testCode.replace(/# df = load_binance_data\([^)]*\)/g, `df = load_binance_data('${currentState.dataFile}')`);
      testCode = testCode.replace('# X, y = prepare_features(df)', 'X, y = prepare_features(df)');
      testCode = testCode.replace('# mse, model = train_and_evaluate(X, y)', 'mse, model = train_and_evaluate(X, y)');
      testCode = testCode.replace("# print(f'MSE: {mse}')", "print(f'MSE: {mse}')");
      
      const testResult = await this.agent.executeTool('testMLPipeline', {
        pythonCode: testCode
      });

      if (testResult.success && testResult.result.mse !== null) {
        const mse = testResult.result.mse;
        console.log(`   ✓ Pipeline tested - MSE: ${mse}`);

        // Update state with new MSE
        const newState = { ...currentState };
        newState.mse = mse;
        newState.mseHistory.push(mse);

        // Update best if improved
        if (mse < currentState.bestMSE) {
          newState.bestMSE = mse;
          newState.bestCode = newCode;
          console.log(`   🌟 New best MSE: ${mse}`);

          // Store in long-term memory
          await this.agent.executeTool('storeLongTermMemory', {
            key: 'best_pipeline_autonomous',
            value: {
              mse: mse,
              code: newCode,
              iteration: currentState.iteration,
              timestamp: new Date().toISOString()
            },
            metadata: { type: 'best_result', autonomous: true }
          });
        }

        return {
          success: true,
          mse: mse,
          improved: mse < currentState.bestMSE,
          nextState: newState
        };
      } else {
        console.log(`   ⚠️  Pipeline test failed or MSE not extracted`);
      }
    }

    return {
      success: true,
      message: 'Pipeline generated but not tested (no data file)',
      nextState: { ...currentState, bestCode: newCode }
    };
  }

  /**
   * Execute feature engineering action
   */
  async _executeFeatureEngineering(currentState) {
    console.log('   Adding technical indicators...');
    
    if (currentState.dataFile) {
      const result = await this.agent.executeTool('calculateCryptoIndicators', {
        filename: currentState.dataFile,
        indicators: ['RSI', 'MACD', 'SMA', 'EMA']
      });

      if (result.success) {
        console.log('   ✓ Technical indicators added');
      }
    }

    return {
      success: true,
      message: 'Feature engineering executed',
      nextState: currentState
    };
  }

  /**
   * Execute data preparation action
   */
  async _executeDataPreparation(currentState) {
    console.log('   Preparing data...');
    
    if (currentState.dataFile) {
      const result = await this.agent.executeTool('analyzeBinanceData', {
        filename: currentState.dataFile
      });

      if (result.success) {
        console.log('   ✓ Data analyzed');
      }
    }

    return {
      success: true,
      message: 'Data preparation executed',
      nextState: { ...currentState, phase: 'optimization' }
    };
  }

  /**
   * Update state based on decision result
   */
  _updateState(currentState, decisionResult) {
    return decisionResult.nextState || currentState;
  }

  /**
   * Log current progress
   */
  _logProgress(state, verbose) {
    if (!verbose) return;

    console.log('\n📊 Current Status:');
    console.log(`   Phase: ${state.phase}`);
    console.log(`   Current MSE: ${state.mse || 'N/A'}`);
    console.log(`   Best MSE: ${state.bestMSE === Infinity ? 'N/A' : state.bestMSE}`);
    console.log(`   Target MSE: ${state.targetMSE}`);
    if (state.mseHistory.length > 0) {
      console.log(`   Recent MSEs: [${state.mseHistory.slice(-3).map(m => m.toFixed(4)).join(', ')}]`);
    }
  }

  /**
   * Store final result in long-term memory
   */
  async _storeFinalResult(state) {
    await this.agent.executeTool('storeLongTermMemory', {
      key: 'autonomous_final_result',
      value: {
        finalMSE: state.mse,
        bestMSE: state.bestMSE,
        iterations: state.iteration,
        achieved: state.bestMSE <= state.threshold,
        timestamp: new Date().toISOString()
      },
      metadata: { type: 'final_result', autonomous: true }
    });
  }
}

// CLI usage
async function main() {
  if (process.argv.length < 3) {
    console.log('Usage: node autonomous_agent.js <dataFile> [threshold] [maxIterations]');
    console.log('\nExample:');
    console.log('  node autonomous_agent.js sample_data.csv 0.05 30');
    console.log('\nNote: Requires ANTHROPIC_API_KEY environment variable');
    process.exit(1);
  }

  const dataFile = process.argv[2];
  const threshold = parseFloat(process.argv[3]) || 0.1;
  const maxIter = parseInt(process.argv[4]) || 50;

  const agent = new ObscureXAgent(process.env.ANTHROPIC_API_KEY);
  const orchestrator = new AutonomousOrchestrator(agent);

  try {
    const result = await orchestrator.runAutonomous({
      dataFile,
      mseThreshold: threshold,
      maxIterations: maxIter,
      verbose: true
    });

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL RESULTS                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(JSON.stringify(result, null, 2));
    console.log();

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Autonomous agent failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export default AutonomousOrchestrator;
export { AutonomousOrchestrator };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
