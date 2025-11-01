import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Tool: Generate ML Pipeline
 * Generates Python code for ML pipelines using CatBoost and/or Neural Networks
 * Optimized for Binance price prediction data
 */
export default {
  name: 'generateMLPipeline',
  description: 'Generate ML pipeline code using CatBoost and/or Neural Networks (works with Binance price data)',
  parameters: { existingCode: 'string|null', prompt: 'string', aiService: 'object|null' },
  
  async execute(params) {
    const { existingCode, prompt, aiService = null } = params;
    
    if (!aiService || !aiService.isAvailable()) {
      throw new Error('AI (Anthropic API) is required for generating ML pipelines. Please provide an API key.');
    }
    
    let code;
    
    // Always use AI Service for code generation
    try {
      if (existingCode) {
        code = await this._optimizeMLPipelineWithAI(existingCode, prompt, aiService);
      } else {
        code = await this._initializeMLPipelineWithAI(prompt, aiService);
      }
    } catch (error) {
      throw new Error(`Failed to generate ML pipeline with AI: ${error.message}`);
    }
    
    // Write to file
    const outputFile = join(process.cwd(), `ml_pipeline_${Date.now()}.py`);
    writeFileSync(outputFile, code, 'utf-8');
    
    return {
      success: true,
      code: code,
      filename: outputFile,
      message: `ML pipeline generated and saved to ${outputFile}`
    };
  },

  /**
   * Initialize a new ML pipeline using AI Service
   */
  async _initializeMLPipelineWithAI(prompt, aiService) {
    const systemPrompt = `You are an expert Python ML engineer specializing in cryptocurrency price prediction pipelines using Binance data.
Generate complete, production-ready Python code for machine learning pipelines.
The code should:
- Be complete and runnable
- Include proper imports
- Use scikit-learn for preprocessing
- Include CatBoost and/or Neural Networks as requested
- Calculate and print MSE as the final output
- Handle data loading from Binance CSV files (timestamp, open, high, low, close, volume format)
- Include proper error handling
- Follow best practices`;

    const userPrompt = `Generate a complete Python ML pipeline for: ${prompt}

Requirements:
- Complete, executable Python code
- Use pandas for data handling
- Work with Binance CSV format (timestamp, open, high, low, close, volume)
- Include train/test split
- Scale features appropriately
- Calculate MSE and print it as "MSE: <value>"
- Add comments for clarity

Return ONLY the Python code, no explanations.`;

    return await aiService.generateCode(userPrompt, systemPrompt, 4096);
  },

  /**
   * Optimize existing ML pipeline using AI Service
   */
  async _optimizeMLPipelineWithAI(existingCode, prompt, aiService) {
    const systemPrompt = `You are an expert Python ML engineer specializing in optimizing cryptocurrency price prediction pipelines.
Your task is to improve existing code based on specific optimization requests.
Maintain the core functionality while adding requested improvements.`;

    const userPrompt = `Here is an existing ML pipeline for Binance price data:

\`\`\`python
${existingCode}
\`\`\`

Optimization request: ${prompt}

Please optimize the code according to the request. Common optimizations include:
- Adding hyperparameter tuning (GridSearchCV or RandomizedSearchCV)
- Adding cross-validation
- Adding feature engineering (polynomial features, feature selection, etc.)
- Improving model architecture
- Adding ensemble methods
- Adding better evaluation metrics

Return ONLY the complete optimized Python code, no explanations.`;

    return await aiService.generateCode(userPrompt, systemPrompt, 4096);
  },

};
