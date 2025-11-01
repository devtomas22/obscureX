#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import AIService from './services/AIService.js';
import { loadTools, getTool } from './tools/toolLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * AI Agent for Binance Cryptocurrency Analysis and ML Pipeline Management
 * Now with modular tools supporting Binance price data analysis
 */

class ObscureXAgent {
  constructor(apiKey = null, memoryPath = './agent_memory.json', longTermMemoryPath = './agent_longterm_memory.json') {
    // Initialize AI Service
    this.aiService = new AIService(apiKey);
    
    // Memory management
    this.memoryPath = memoryPath;
    this.longTermMemoryPath = longTermMemoryPath;
    this.memory = this._loadMemory(memoryPath);
    this.longTermMemory = this._loadMemory(longTermMemoryPath);
    
    // Session tracking
    this.sessionId = `session_${Date.now()}_${randomBytes(4).toString('hex')}`;
    
    // Tools will be loaded dynamically
    this.tools = [];
    this._toolsLoaded = false;
  }

  /**
   * Load tools dynamically from the tools directory
   */
  async _ensureToolsLoaded() {
    if (!this._toolsLoaded) {
      this.tools = await loadTools();
      this._toolsLoaded = true;
    }
  }

  /**
   * Load memory from JSON file
   */
  _loadMemory(path) {
    try {
      if (existsSync(path)) {
        const content = readFileSync(path, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to load memory from ${path}:`, error.message);
    }
    return { entries: [], metadata: { created: new Date().toISOString() } };
  }

  /**
   * Save memory to JSON file
   */
  _saveMemory(path, memory) {
    try {
      memory.metadata.lastUpdated = new Date().toISOString();
      writeFileSync(path, JSON.stringify(memory, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save memory to ${path}:`, error.message);
    }
  }

  /**
   * Execute a tool by name with given parameters
   */
  async executeTool(toolName, params) {
    await this._ensureToolsLoaded();
    
    const tool = getTool(this.tools, toolName);
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    
    try {
      // Create context for tool execution
      const context = {
        memory: this.memory,
        longTermMemory: this.longTermMemory,
        sessionId: this.sessionId,
        saveMemory: this._saveMemory.bind(this),
        memoryPath: this.memoryPath,
        longTermMemoryPath: this.longTermMemoryPath,
        aiService: this.aiService
      };
      
      // For tools that need AI, pass aiService in params
      const aiRequiredTools = [
        'generateMLPipeline', 
        'analyzeContext', 
        'getExecutionOptions',
        'recommendOptimizationStrategy',
        'executeAutonomousDecision'
      ];
      
      if (aiRequiredTools.includes(toolName)) {
        params = { ...params, aiService: this.aiService };
      }
      
      const result = await tool.execute(params, context);
      return {
        success: true,
        tool: toolName,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        tool: toolName,
        error: error.message
      };
    }
  }

  /**
   * List all available tools
   */
  async listTools() {
    await this._ensureToolsLoaded();
    
    return this.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
      category: t.category
    }));
  }

  /**
   * Orchestrator: Continuously optimize ML pipeline until MSE threshold is met
   */
  async runOptimizationLoop(config) {
    const {
      dataFile = null,
      initialPrompt = 'Create a price prediction pipeline for Binance data using CatBoost',
      mseThreshold = 0.1,
      maxIterations = 50,
      verbose = true
    } = config;

    console.log('=== Starting Optimization Orchestrator ===');
    console.log(`MSE Threshold: ${mseThreshold}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Session ID: ${this.sessionId}\n`);

    // Initialize orchestrator state in memory
    await this.executeTool('storeMemory', {
      key: 'orchestrator_config',
      value: config,
      metadata: { type: 'config' }
    });

    let iteration = 0;
    let currentCode = null;
    let bestMSE = Infinity;
    let bestCode = null;
    let lastMSE = null;

    // Try to load previous best from long-term memory
    const previousBest = await this.executeTool('retrieveLongTermMemory', { key: 'best_pipeline' });
    if (previousBest.success && previousBest.result.success) {
      console.log('Found previous best pipeline in long-term memory');
      console.log(`Previous best MSE: ${previousBest.result.value.mse}\n`);
      if (previousBest.result.value.mse < mseThreshold) {
        console.log('Previous best already meets threshold! Using it as starting point.');
        bestCode = previousBest.result.value.code;
        bestMSE = previousBest.result.value.mse;
      }
    }

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n--- Iteration ${iteration}/${maxIterations} ---`);

      try {
        // Step 1: Generate or optimize pipeline
        let prompt;
        if (iteration === 1 && !currentCode) {
          prompt = initialPrompt;
          console.log('Generating initial pipeline...');
        } else {
          prompt = await this._generateOptimizationPrompt(currentCode, lastMSE, iteration);
          console.log(`Optimization strategy: ${prompt}`);
        }

        const generateResult = await this.executeTool('generateMLPipeline', {
          existingCode: currentCode,
          prompt: prompt
        });

        if (!generateResult.success) {
          console.error('Failed to generate pipeline:', generateResult.error);
          continue;
        }

        currentCode = generateResult.result.code;
        console.log(`Generated pipeline saved to: ${generateResult.result.filename}`);

        // Step 2: Test the pipeline
        console.log('Testing pipeline...');
        
        let testCode = currentCode;
        if (dataFile) {
          // Replace template comments with actual data file usage
          testCode = testCode.replace(/# df = load_binance_data\([^)]*\)/g, `df = load_binance_data('${dataFile}')`);
          testCode = testCode.replace('# X, y = prepare_features(df)', 'X, y = prepare_features(df)');
          testCode = testCode.replace('# mse, model = train_and_evaluate(X, y)', 'mse, model = train_and_evaluate(X, y)');
          testCode = testCode.replace("# print(f'MSE: {mse}')", "print(f'MSE: {mse}')");
          testCode = testCode.replace('print(\'Pipeline template generated for Binance price data.\')', '');
          testCode = testCode.replace("print('MSE: 0.0')", '');
        }

        const testResult = await this.executeTool('testMLPipeline', {
          pythonCode: testCode
        });

        if (!testResult.success || testResult.result.mse === null) {
          console.error('Failed to test pipeline or extract MSE');
          console.log('Output:', testResult.result?.output || testResult.error);
          
          await this.executeTool('storeMemory', {
            key: `iteration_${iteration}`,
            value: {
              iteration,
              success: false,
              error: testResult.error || 'MSE extraction failed',
              code: currentCode
            },
            metadata: { type: 'iteration_result' }
          });
          continue;
        }

        lastMSE = testResult.result.mse;
        console.log(`MSE: ${lastMSE}`);

        // Step 3: Store iteration result
        await this.executeTool('storeMemory', {
          key: `iteration_${iteration}`,
          value: {
            iteration,
            mse: lastMSE,
            code: currentCode,
            timestamp: new Date().toISOString()
          },
          metadata: { type: 'iteration_result' }
        });

        // Step 4: Update best if improved
        if (lastMSE < bestMSE) {
          bestMSE = lastMSE;
          bestCode = currentCode;
          console.log(`✓ New best MSE: ${bestMSE}`);

          await this.executeTool('storeLongTermMemory', {
            key: 'best_pipeline',
            value: {
              mse: bestMSE,
              code: bestCode,
              iteration,
              timestamp: new Date().toISOString()
            },
            metadata: { type: 'best_result' }
          });

          // Step 5: Check if threshold is met
          if (bestMSE <= mseThreshold) {
            console.log(`\n✓✓✓ SUCCESS! MSE ${bestMSE} meets threshold ${mseThreshold} ✓✓✓`);
            console.log(`Achieved in ${iteration} iterations`);
            
            const finalFile = join(process.cwd(), `best_pipeline_mse_${bestMSE.toFixed(6)}.py`);
            writeFileSync(finalFile, bestCode, 'utf-8');
            console.log(`Best pipeline saved to: ${finalFile}`);
            
            return {
              success: true,
              iterations: iteration,
              bestMSE,
              bestCode,
              filename: finalFile
            };
          }
        } else {
          console.log(`No improvement (best: ${bestMSE})`);
        }

      } catch (error) {
        console.error(`Error in iteration ${iteration}:`, error.message);
        
        await this.executeTool('storeMemory', {
          key: `iteration_${iteration}_error`,
          value: {
            iteration,
            error: error.message,
            stack: error.stack
          },
          metadata: { type: 'error' }
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n--- Optimization Complete ---`);
    console.log(`Maximum iterations (${maxIterations}) reached`);
    console.log(`Best MSE achieved: ${bestMSE}`);
    console.log(`Threshold: ${mseThreshold}`);
    
    if (bestCode) {
      const finalFile = join(process.cwd(), `final_pipeline_mse_${bestMSE.toFixed(6)}.py`);
      writeFileSync(finalFile, bestCode, 'utf-8');
      console.log(`Best pipeline saved to: ${finalFile}`);
    }

    return {
      success: bestMSE <= mseThreshold,
      iterations: maxIterations,
      bestMSE,
      bestCode,
      message: bestMSE <= mseThreshold ? 'Threshold met' : 'Threshold not met within max iterations'
    };
  }

  /**
   * Generate optimization prompt using AI or fallback
   */
  async _generateOptimizationPrompt(currentCode, lastMSE, iteration) {
    if (!this.aiService.isAvailable()) {
      const strategies = [
        'Add hyperparameter tuning with GridSearchCV',
        'Add feature engineering with polynomial features',
        'Add cross-validation for better generalization',
        'Try ensemble methods combining multiple models',
        'Add feature selection to remove noise',
        'Increase model complexity',
        'Add regularization to prevent overfitting',
        'Try different preprocessing techniques'
      ];
      return strategies[iteration % strategies.length];
    }

    try {
      const recentResults = await this.executeTool('searchMemory', { query: 'iteration' });
      const history = recentResults.result.results
        .filter(r => r.value.mse !== undefined)
        .slice(-5)
        .map(r => `Iteration ${r.value.iteration}: MSE ${r.value.mse}`)
        .join('\n');

      const prompt = `Based on the ML pipeline optimization history for Binance price data, suggest the next optimization strategy.

Current MSE: ${lastMSE}
Iteration: ${iteration}

Recent history:
${history}

What specific optimization should be applied next to reduce MSE? Be concise and specific.`;

      const systemPrompt = 'You are an expert ML optimization strategist for cryptocurrency price prediction pipelines.';

      return await this.aiService.generateText(prompt, systemPrompt, 200);
    } catch (error) {
      console.warn('Failed to generate AI prompt, using fallback:', error.message);
      return 'Optimize hyperparameters and add cross-validation';
    }
  }

  /**
   * Interactive CLI mode
   */
  async interactiveMode() {
    console.log('ObscureX AI Agent - Interactive Mode');
    console.log('=====================================\n');
    console.log('Available tools:');
    const tools = await this.listTools();
    tools.forEach((tool, idx) => {
      console.log(`${idx + 1}. [${tool.category}] ${tool.name}: ${tool.description}`);
    });
    console.log('\nType "exit" to quit\n');
    console.log('Use agent.executeTool(toolName, params) to execute tools programmatically');
  }
}

// Export for use as a module
export default ObscureXAgent;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new ObscureXAgent();
  
  if (process.argv.length > 2) {
    const command = process.argv[2];
    
    if (command === 'list-tools') {
      agent.listTools().then(tools => {
        console.log(JSON.stringify(tools, null, 2));
      });
    } else if (command === 'interactive') {
      agent.interactiveMode();
    } else if (command === 'optimize') {
      const dataFile = process.argv[3] || null;
      const threshold = parseFloat(process.argv[4]) || 0.1;
      const maxIter = parseInt(process.argv[5]) || 50;
      
      agent.runOptimizationLoop({
        dataFile,
        mseThreshold: threshold,
        maxIterations: maxIter,
        initialPrompt: 'Create a comprehensive price prediction pipeline for Binance data using CatBoost with proper feature engineering',
        verbose: true
      }).then(result => {
        console.log('\n=== Final Result ===');
        console.log(JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('Optimization failed:', error);
        process.exit(1);
      });
    } else {
      console.log('Usage:');
      console.log('  node agent.js list-tools                          - List all available tools');
      console.log('  node agent.js interactive                         - Start interactive mode');
      console.log('  node agent.js optimize [dataFile] [threshold] [maxIter] - Run optimization loop');
      console.log('\nExamples:');
      console.log('  node agent.js optimize binance_data.csv 0.05 30   - Optimize until MSE < 0.05');
      console.log('\nOr import the agent in your code:');
      console.log('  import ObscureXAgent from "./agent.js"');
    }
  } else {
    console.log('ObscureX AI Agent - Binance Crypto Analysis\n');
    console.log('Usage:');
    console.log('  node agent.js list-tools                          - List all available tools');
    console.log('  node agent.js interactive                         - Start interactive mode');
    console.log('  node agent.js optimize [dataFile] [threshold] [maxIter] - Run optimization loop');
    console.log('\nExamples:');
    console.log('  node agent.js optimize binance_data.csv 0.05 30   - Optimize until MSE < 0.05');
    console.log('\nOr import the agent in your code:');
    console.log('  import ObscureXAgent from "./agent.js"');
  }
}
