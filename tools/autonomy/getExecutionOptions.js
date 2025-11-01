/**
 * Tool: Get Execution Options
 * Provides AI with available execution flow options based on current state
 */
export default {
  name: 'getExecutionOptions',
  description: 'Get available execution flow options and next possible actions based on current state',
  parameters: { 
    currentPhase: 'string', // Current execution phase (e.g., 'initialization', 'optimization', 'evaluation')
    currentState: 'object', // Current state (MSE, iteration, etc.)
    anthropic: 'object|null'
  },
  
  async execute(params, context) {
    const { currentPhase, currentState, anthropic } = params;
    
    // Define available options based on phase
    const baseOptions = this._getBaseOptions(currentPhase, currentState);
    
    // If AI is available, enhance with AI recommendations
    if (anthropic) {
      const aiRecommendations = await this._getAIRecommendations(
        currentPhase, 
        currentState, 
        baseOptions,
        anthropic
      );
      return {
        phase: currentPhase,
        options: baseOptions,
        aiRecommendations,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      phase: currentPhase,
      options: baseOptions,
      timestamp: new Date().toISOString()
    };
  },
  
  /**
   * Get base execution options for current phase
   */
  _getBaseOptions(phase, state) {
    const options = {
      initialization: [
        {
          action: 'download_data',
          description: 'Download new Binance price data',
          tools: ['downloadBinancePriceHistory'],
          prerequisites: []
        },
        {
          action: 'analyze_existing_data',
          description: 'Analyze existing CSV data',
          tools: ['analyzeBinanceData', 'listTechnicalIndicators'],
          prerequisites: ['data_file_exists']
        },
        {
          action: 'add_indicators',
          description: 'Add technical indicators to data',
          tools: ['calculateCryptoIndicators', 'addTechnicalIndicator'],
          prerequisites: ['data_file_exists']
        },
        {
          action: 'start_optimization',
          description: 'Begin ML pipeline optimization',
          tools: ['generateMLPipeline', 'testMLPipeline'],
          prerequisites: ['data_file_exists']
        }
      ],
      
      optimization: [
        {
          action: 'continue_optimization',
          description: 'Continue with current optimization strategy',
          tools: ['generateMLPipeline', 'testMLPipeline'],
          prerequisites: [],
          condition: state.mse > state.threshold
        },
        {
          action: 'add_features',
          description: 'Add more technical indicators for better prediction',
          tools: ['calculateCryptoIndicators', 'addTechnicalIndicator'],
          prerequisites: ['data_file_exists']
        },
        {
          action: 'hyperparameter_tuning',
          description: 'Apply hyperparameter tuning to current model',
          tools: ['generateMLPipeline'],
          prerequisites: ['existing_pipeline'],
          optimization: 'Add GridSearchCV or RandomizedSearchCV'
        },
        {
          action: 'feature_engineering',
          description: 'Apply advanced feature engineering',
          tools: ['generateMLPipeline'],
          prerequisites: ['existing_pipeline'],
          optimization: 'Add polynomial features, feature interactions'
        },
        {
          action: 'ensemble_methods',
          description: 'Try ensemble methods to improve accuracy',
          tools: ['generateMLPipeline'],
          prerequisites: ['existing_pipeline'],
          optimization: 'Combine multiple models with voting or stacking'
        },
        {
          action: 'cross_validation',
          description: 'Add cross-validation for better generalization',
          tools: ['generateMLPipeline'],
          prerequisites: ['existing_pipeline'],
          optimization: 'Add k-fold cross-validation'
        },
        {
          action: 'try_different_model',
          description: 'Switch to a different model architecture',
          tools: ['generateMLPipeline'],
          prerequisites: [],
          modelSuggestions: ['CatBoost', 'Neural Network', 'Random Forest', 'XGBoost', 'LSTM']
        },
        {
          action: 'analyze_results',
          description: 'Analyze current results and decide next step',
          tools: ['analyzeContext', 'searchMemory'],
          prerequisites: []
        }
      ],
      
      evaluation: [
        {
          action: 'test_pipeline',
          description: 'Test current pipeline on data',
          tools: ['testMLPipeline'],
          prerequisites: ['existing_pipeline']
        },
        {
          action: 'store_best_model',
          description: 'Store the best model in long-term memory',
          tools: ['storeLongTermMemory'],
          prerequisites: ['mse_improved']
        },
        {
          action: 'restart_optimization',
          description: 'Restart optimization with different approach',
          tools: ['generateMLPipeline'],
          prerequisites: []
        },
        {
          action: 'finalize',
          description: 'Finalize optimization and save best pipeline',
          tools: ['storeLongTermMemory'],
          prerequisites: ['threshold_met']
        }
      ]
    };
    
    return options[phase] || options.optimization;
  },
  
  /**
   * Get AI recommendations for next action
   */
  async _getAIRecommendations(phase, state, options, anthropic) {
    const systemPrompt = `You are an AI execution flow advisor for ML pipeline optimization.
Given the current phase, state, and available options, recommend the best next action(s).`;

    const userPrompt = `Current execution phase: ${phase}

Current state:
${JSON.stringify(state, null, 2)}

Available options:
${JSON.stringify(options, null, 2)}

Based on the current state and available options, what are the top 3 recommended actions?
Rank them by priority and provide reasoning for each.

Format response as JSON array of recommendations.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: userPrompt
        }],
        system: systemPrompt
      });

      const responseText = message.content[0].text;
      
      // Try to parse JSON response
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        }
      }
      
      return JSON.parse(jsonText);
    } catch (error) {
      return [{
        action: options[0]?.action || 'continue_optimization',
        priority: 1,
        reasoning: 'Default recommendation due to AI parsing error'
      }];
    }
  }
};
