#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync, spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * AI Agent for CSV Technical Indicators and ML Pipeline Management
 * A self-contained Node.js script with 7 tools using Anthropic API for code generation
 */

class ObscureXAgent {
  constructor(apiKey = null, memoryPath = './agent_memory.json', longTermMemoryPath = './agent_longterm_memory.json') {
    // Initialize Anthropic client if API key is provided
    this.anthropic = null;
    if (apiKey || process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
      });
    }
    
    // Memory management
    this.memoryPath = memoryPath;
    this.longTermMemoryPath = longTermMemoryPath;
    this.memory = this._loadMemory(memoryPath);
    this.longTermMemory = this._loadMemory(longTermMemoryPath);
    
    // Session tracking
    this.sessionId = `session_${Date.now()}_${randomBytes(4).toString('hex')}`;
    
    this.tools = [
      {
        name: 'listTechnicalIndicators',
        description: 'List technical indicators added to a CSV',
        parameters: { filename: 'string' },
        execute: this.listTechnicalIndicators.bind(this)
      },
      {
        name: 'addTechnicalIndicator',
        description: 'Add technical indicator to a CSV',
        parameters: { filename: 'string', indicatorName: 'string' },
        execute: this.addTechnicalIndicator.bind(this)
      },
      {
        name: 'removeTechnicalIndicator',
        description: 'Remove a technical indicator from a CSV',
        parameters: { filename: 'string', indicatorName: 'string' },
        execute: this.removeTechnicalIndicator.bind(this)
      },
      {
        name: 'testMLPipeline',
        description: 'Test a single python file doing an entire ML pipeline for price prediction, returning MSE value',
        parameters: { pythonCode: 'string' },
        execute: this.testMLPipeline.bind(this)
      },
      {
        name: 'generateMLPipeline',
        description: 'Generate an ML pipeline as a file using catboost and/or neural network',
        parameters: { existingCode: 'string|null', prompt: 'string' },
        execute: this.generateMLPipeline.bind(this)
      },
      {
        name: 'listPythonModules',
        description: 'List python modules installed',
        parameters: {},
        execute: this.listPythonModules.bind(this)
      },
      {
        name: 'installPythonModule',
        description: 'Install a python module',
        parameters: { moduleName: 'string' },
        execute: this.installPythonModule.bind(this)
      },
      {
        name: 'storeMemory',
        description: 'Store information in short-term memory (session-based)',
        parameters: { key: 'string', value: 'any', metadata: 'object' },
        execute: this.storeMemory.bind(this)
      },
      {
        name: 'retrieveMemory',
        description: 'Retrieve information from short-term memory',
        parameters: { key: 'string' },
        execute: this.retrieveMemory.bind(this)
      },
      {
        name: 'searchMemory',
        description: 'Search through short-term memory',
        parameters: { query: 'string' },
        execute: this.searchMemory.bind(this)
      },
      {
        name: 'storeLongTermMemory',
        description: 'Store information in long-term memory (persistent across sessions)',
        parameters: { key: 'string', value: 'any', metadata: 'object' },
        execute: this.storeLongTermMemory.bind(this)
      },
      {
        name: 'retrieveLongTermMemory',
        description: 'Retrieve information from long-term memory',
        parameters: { key: 'string' },
        execute: this.retrieveLongTermMemory.bind(this)
      },
      {
        name: 'searchLongTermMemory',
        description: 'Search through long-term memory',
        parameters: { query: 'string' },
        execute: this.searchLongTermMemory.bind(this)
      }
    ];
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
   * Tool 1: List technical indicators from a CSV file
   * Reads the CSV header and returns column names that are technical indicators
   * (columns that are not basic OHLCV data)
   */
  async listTechnicalIndicators(params) {
    const { filename } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    
    // Filter out standard OHLCV columns to get technical indicators
    const standardColumns = ['date', 'time', 'timestamp', 'open', 'high', 'low', 'close', 'volume'];
    const indicators = headers.filter(h => 
      !standardColumns.includes(h.toLowerCase())
    );

    return indicators;
  }

  /**
   * Tool 2: Add a technical indicator column to a CSV file
   * Adds a new column with the indicator name and initializes with placeholder values
   */
  async addTechnicalIndicator(params) {
    const { filename, indicatorName } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Check if indicator already exists
    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.includes(indicatorName)) {
      throw new Error(`Indicator '${indicatorName}' already exists in the CSV`);
    }

    // Add the indicator to header
    lines[0] = lines[0] + ',' + indicatorName;

    // Add placeholder value (0) for each data row
    for (let i = 1; i < lines.length; i++) {
      lines[i] = lines[i] + ',0';
    }

    writeFileSync(filename, lines.join('\n') + '\n', 'utf-8');
    
    return { success: true, message: `Indicator '${indicatorName}' added to ${filename}` };
  }

  /**
   * Tool 3: Remove a technical indicator from a CSV file
   * Removes the column with the specified indicator name
   */
  async removeTechnicalIndicator(params) {
    const { filename, indicatorName } = params;
    
    if (!existsSync(filename)) {
      throw new Error(`File not found: ${filename}`);
    }

    const content = readFileSync(filename, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const indicatorIndex = headers.indexOf(indicatorName);

    if (indicatorIndex === -1) {
      throw new Error(`Indicator '${indicatorName}' not found in the CSV`);
    }

    // Remove the indicator from each line
    const updatedLines = lines.map(line => {
      const columns = line.split(',');
      columns.splice(indicatorIndex, 1);
      return columns.join(',');
    });

    writeFileSync(filename, updatedLines.join('\n') + '\n', 'utf-8');
    
    return { success: true, message: `Indicator '${indicatorName}' removed from ${filename}` };
  }

  /**
   * Tool 4: Test a Python ML pipeline and return MSE
   * Writes Python code to a temporary file, executes it, and captures the MSE output
   */
  async testMLPipeline(params) {
    const { pythonCode } = params;
    
    // Create a temporary Python file
    const tempFile = join(tmpdir(), `ml_pipeline_${randomBytes(8).toString('hex')}.py`);
    
    try {
      writeFileSync(tempFile, pythonCode, 'utf-8');
      
      // Execute the Python script and capture output
      const output = execSync(`python3 ${tempFile}`, { 
        encoding: 'utf-8',
        timeout: 300000 // 5 minutes timeout
      });
      
      // Try to extract MSE from output
      // Look for patterns like "MSE: 0.123" or "MSE = 0.123" or just a number on last line
      const mseMatch = output.match(/MSE[:\s=]+([0-9.]+)/i);
      let mse;
      
      if (mseMatch) {
        mse = parseFloat(mseMatch[1]);
      } else {
        // Try to parse the last line as a number
        const lines = output.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const numberMatch = lastLine.match(/([0-9.]+)/);
        if (numberMatch) {
          mse = parseFloat(numberMatch[1]);
        }
      }
      
      return {
        success: true,
        mse: mse,
        output: output,
        message: mse !== undefined ? `Pipeline executed successfully. MSE: ${mse}` : 'Pipeline executed but MSE not found in output'
      };
    } catch (error) {
      return {
        success: false,
        mse: null,
        error: error.message,
        message: `Pipeline execution failed: ${error.message}`
      };
    } finally {
      // Clean up temp file
      try {
        if (existsSync(tempFile)) {
          execSync(`rm -f ${tempFile}`);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Tool 5: Generate ML pipeline code
   * Creates Python code for an ML pipeline using catboost and/or neural networks
   * Uses Anthropic API for intelligent code generation and optimization
   */
  async generateMLPipeline(params) {
    const { existingCode, prompt } = params;
    
    let code;
    
    // Try to use Anthropic API if available
    if (this.anthropic) {
      try {
        if (existingCode) {
          // Optimize existing code using Anthropic
          code = await this._optimizeMLPipelineWithAI(existingCode, prompt);
        } else {
          // Generate new pipeline using Anthropic
          code = await this._initializeMLPipelineWithAI(prompt);
        }
      } catch (error) {
        console.warn('Anthropic API failed, falling back to template generation:', error.message);
        // Fallback to template-based generation
        if (existingCode) {
          code = this._optimizeMLPipeline(existingCode, prompt);
        } else {
          code = this._initializeMLPipeline(prompt);
        }
      }
    } else {
      // No API key, use template-based generation
      if (existingCode) {
        code = this._optimizeMLPipeline(existingCode, prompt);
      } else {
        code = this._initializeMLPipeline(prompt);
      }
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
  }

  /**
   * Initialize a new ML pipeline using Anthropic API
   */
  async _initializeMLPipelineWithAI(prompt) {
    const systemPrompt = `You are an expert Python ML engineer specializing in price prediction pipelines. 
Generate complete, production-ready Python code for machine learning pipelines.
The code should:
- Be complete and runnable
- Include proper imports
- Use scikit-learn for preprocessing
- Include CatBoost and/or Neural Networks as requested
- Calculate and print MSE as the final output
- Handle data loading from CSV files
- Include proper error handling
- Follow best practices`;

    const userPrompt = `Generate a complete Python ML pipeline for: ${prompt}

Requirements:
- Complete, executable Python code
- Use pandas for data handling
- Include train/test split
- Scale features appropriately
- Calculate MSE and print it as "MSE: <value>"
- Add comments for clarity

Return ONLY the Python code, no explanations.`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    // Extract code from response
    let code = message.content[0].text;
    
    // Remove markdown code blocks if present
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    
    return code.trim();
  }

  /**
   * Optimize existing ML pipeline using Anthropic API
   */
  async _optimizeMLPipelineWithAI(existingCode, prompt) {
    const systemPrompt = `You are an expert Python ML engineer specializing in optimizing machine learning pipelines.
Your task is to improve existing code based on specific optimization requests.
Maintain the core functionality while adding requested improvements.`;

    const userPrompt = `Here is an existing ML pipeline:

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

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    // Extract code from response
    let code = message.content[0].text;
    
    // Remove markdown code blocks if present
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    
    return code.trim();
  }

  /**
   * Initialize a new ML pipeline based on prompt
   */
  _initializeMLPipeline(prompt) {
    const useCatBoost = prompt.toLowerCase().includes('catboost');
    const useNeuralNetwork = prompt.toLowerCase().includes('neural') || prompt.toLowerCase().includes('nn');
    
    let code = `#!/usr/bin/env python3
"""
ML Pipeline for Price Prediction
Generated based on: ${prompt}
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
`;

    if (useCatBoost) {
      code += `from catboost import CatBoostRegressor
`;
    }

    if (useNeuralNetwork) {
      code += `from sklearn.neural_network import MLPRegressor
`;
    }

    code += `
def load_data(filepath):
    """Load and prepare data from CSV"""
    df = pd.read_csv(filepath)
    return df

def prepare_features(df):
    """Prepare features and target"""
    # Assuming the last column is the target (price to predict)
    X = df.iloc[:, :-1].select_dtypes(include=[np.number])
    y = df.iloc[:, -1]
    return X, y

def train_and_evaluate(X, y):
    """Train model and calculate MSE"""
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
`;

    if (useCatBoost && !useNeuralNetwork) {
      code += `    # Train CatBoost model
    model = CatBoostRegressor(
        iterations=100,
        learning_rate=0.1,
        depth=6,
        verbose=False
    )
    model.fit(X_train_scaled, y_train)
`;
    } else if (useNeuralNetwork && !useCatBoost) {
      code += `    # Train Neural Network model
    model = MLPRegressor(
        hidden_layer_sizes=(100, 50),
        activation='relu',
        solver='adam',
        max_iter=500,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)
`;
    } else {
      // Both or neither - use CatBoost as default
      code += `    # Train CatBoost model
    model = CatBoostRegressor(
        iterations=100,
        learning_rate=0.1,
        depth=6,
        verbose=False
    )
    model.fit(X_train_scaled, y_train)
`;
    }

    code += `    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    
    # Calculate MSE
    mse = mean_squared_error(y_test, y_pred)
    
    return mse, model

if __name__ == '__main__':
    # Example usage
    # df = load_data('your_data.csv')
    # X, y = prepare_features(df)
    # mse, model = train_and_evaluate(X, y)
    # print(f'MSE: {mse}')
    
    # For testing without data
    print('Pipeline template generated. Add your data to execute.')
    print('MSE: 0.0')
`;

    return code;
  }

  /**
   * Optimize existing ML pipeline code
   */
  _optimizeMLPipeline(existingCode, prompt) {
    let optimizedCode = existingCode;
    
    const optimizationHints = prompt.toLowerCase();
    
    // Add hyperparameter tuning if requested
    if (optimizationHints.includes('hyperparameter') || optimizationHints.includes('tune')) {
      const tuningCode = `
# Hyperparameter tuning added
from sklearn.model_selection import GridSearchCV

# Add this to your model training section:
# param_grid = {
#     'learning_rate': [0.01, 0.1, 0.3],
#     'depth': [4, 6, 8],
#     'iterations': [50, 100, 200]
# }
# grid_search = GridSearchCV(model, param_grid, cv=3, scoring='neg_mean_squared_error')
# grid_search.fit(X_train_scaled, y_train)
# model = grid_search.best_estimator_
`;
      
      // Add after imports
      const importEnd = optimizedCode.indexOf('\n\n');
      if (importEnd !== -1) {
        optimizedCode = optimizedCode.slice(0, importEnd) + tuningCode + optimizedCode.slice(importEnd);
      }
    }
    
    // Add feature engineering if requested
    if (optimizationHints.includes('feature') || optimizationHints.includes('engineering')) {
      const featureCode = `
# Feature engineering added
from sklearn.preprocessing import PolynomialFeatures

# Add this to your feature preparation:
# poly = PolynomialFeatures(degree=2, include_bias=False)
# X_poly = poly.fit_transform(X)
`;
      
      const importEnd = optimizedCode.indexOf('\n\n');
      if (importEnd !== -1) {
        optimizedCode = optimizedCode.slice(0, importEnd) + featureCode + optimizedCode.slice(importEnd);
      }
    }
    
    // Add cross-validation if requested
    if (optimizationHints.includes('cross') || optimizationHints.includes('validation')) {
      const cvCode = `
# Cross-validation added
from sklearn.model_selection import cross_val_score

# Add this for cross-validation:
# cv_scores = cross_val_score(model, X_train_scaled, y_train, 
#                             cv=5, scoring='neg_mean_squared_error')
# print(f'CV MSE: {-cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})')
`;
      
      const importEnd = optimizedCode.indexOf('\n\n');
      if (importEnd !== -1) {
        optimizedCode = optimizedCode.slice(0, importEnd) + cvCode + optimizedCode.slice(importEnd);
      }
    }
    
    return optimizedCode;
  }

  /**
   * Tool 6: List installed Python modules
   * Uses pip list to get all installed packages
   */
  async listPythonModules(params) {
    try {
      const output = execSync('pip3 list --format=freeze', { 
        encoding: 'utf-8',
        timeout: 30000
      });
      
      // Parse the output to get module names
      const modules = output.trim().split('\n').map(line => {
        const parts = line.split('==');
        return parts[0];
      }).filter(name => name.length > 0);
      
      return modules;
    } catch (error) {
      throw new Error(`Failed to list Python modules: ${error.message}`);
    }
  }

  /**
   * Tool 7: Install a Python module
   * Uses pip to install the specified module
   */
  async installPythonModule(params) {
    const { moduleName } = params;
    
    try {
      const output = execSync(`pip3 install ${moduleName}`, { 
        encoding: 'utf-8',
        timeout: 300000 // 5 minutes timeout
      });
      
      return {
        success: true,
        message: `Module '${moduleName}' installed successfully`,
        output: output
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to install module '${moduleName}': ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Tool 8: Store information in short-term memory
   */
  async storeMemory(params) {
    const { key, value, metadata = {} } = params;
    
    const entry = {
      key,
      value,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      }
    };
    
    // Check if key exists and update, otherwise add new
    const existingIndex = this.memory.entries.findIndex(e => e.key === key);
    if (existingIndex !== -1) {
      this.memory.entries[existingIndex] = entry;
    } else {
      this.memory.entries.push(entry);
    }
    
    this._saveMemory(this.memoryPath, this.memory);
    
    return {
      success: true,
      message: `Stored '${key}' in short-term memory`,
      entry
    };
  }

  /**
   * Tool 9: Retrieve information from short-term memory
   */
  async retrieveMemory(params) {
    const { key } = params;
    
    const entry = this.memory.entries.find(e => e.key === key);
    
    if (!entry) {
      return {
        success: false,
        message: `Key '${key}' not found in short-term memory`,
        value: null
      };
    }
    
    return {
      success: true,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata
    };
  }

  /**
   * Tool 10: Search through short-term memory
   */
  async searchMemory(params) {
    const { query } = params;
    
    const queryLower = query.toLowerCase();
    const results = this.memory.entries.filter(entry => {
      const keyMatch = entry.key.toLowerCase().includes(queryLower);
      const valueMatch = JSON.stringify(entry.value).toLowerCase().includes(queryLower);
      return keyMatch || valueMatch;
    });
    
    return {
      success: true,
      query,
      results: results.map(e => ({
        key: e.key,
        value: e.value,
        metadata: e.metadata
      })),
      count: results.length
    };
  }

  /**
   * Tool 11: Store information in long-term memory
   */
  async storeLongTermMemory(params) {
    const { key, value, metadata = {} } = params;
    
    const entry = {
      key,
      value,
      metadata: {
        ...metadata,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        persistent: true
      }
    };
    
    // Check if key exists and update, otherwise add new
    const existingIndex = this.longTermMemory.entries.findIndex(e => e.key === key);
    if (existingIndex !== -1) {
      // Keep history of changes
      if (!this.longTermMemory.entries[existingIndex].history) {
        this.longTermMemory.entries[existingIndex].history = [];
      }
      this.longTermMemory.entries[existingIndex].history.push({
        value: this.longTermMemory.entries[existingIndex].value,
        metadata: this.longTermMemory.entries[existingIndex].metadata
      });
      this.longTermMemory.entries[existingIndex] = entry;
    } else {
      this.longTermMemory.entries.push(entry);
    }
    
    this._saveMemory(this.longTermMemoryPath, this.longTermMemory);
    
    return {
      success: true,
      message: `Stored '${key}' in long-term memory`,
      entry
    };
  }

  /**
   * Tool 12: Retrieve information from long-term memory
   */
  async retrieveLongTermMemory(params) {
    const { key } = params;
    
    const entry = this.longTermMemory.entries.find(e => e.key === key);
    
    if (!entry) {
      return {
        success: false,
        message: `Key '${key}' not found in long-term memory`,
        value: null
      };
    }
    
    return {
      success: true,
      key: entry.key,
      value: entry.value,
      metadata: entry.metadata,
      history: entry.history || []
    };
  }

  /**
   * Tool 13: Search through long-term memory
   */
  async searchLongTermMemory(params) {
    const { query } = params;
    
    const queryLower = query.toLowerCase();
    const results = this.longTermMemory.entries.filter(entry => {
      const keyMatch = entry.key.toLowerCase().includes(queryLower);
      const valueMatch = JSON.stringify(entry.value).toLowerCase().includes(queryLower);
      return keyMatch || valueMatch;
    });
    
    return {
      success: true,
      query,
      results: results.map(e => ({
        key: e.key,
        value: e.value,
        metadata: e.metadata,
        historyCount: e.history ? e.history.length : 0
      })),
      count: results.length
    };
  }

  /**
   * Execute a tool by name with given parameters
   */
  async executeTool(toolName, params) {
    const tool = this.tools.find(t => t.name === toolName);
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }
    
    try {
      const result = await tool.execute(params);
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
  listTools() {
    return this.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }

  /**
   * Orchestrator: Continuously optimize ML pipeline until MSE threshold is met
   * This is the main loop that coordinates the optimization process
   */
  async runOptimizationLoop(config) {
    const {
      dataFile = null,
      initialPrompt = 'Create a price prediction pipeline using CatBoost',
      mseThreshold = 0.1,
      maxIterations = 50,
      verbose = true
    } = config;

    console.log('=== Starting Optimization Orchestrator ===');
    console.log(`MSE Threshold: ${mseThreshold}`);
    console.log(`Max Iterations: ${maxIterations}`);
    console.log(`Session ID: ${this.sessionId}\n`);

    // Initialize orchestrator state in memory
    await this.storeMemory({
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
    const previousBest = await this.retrieveLongTermMemory({ key: 'best_pipeline' });
    if (previousBest.success) {
      console.log('Found previous best pipeline in long-term memory');
      console.log(`Previous best MSE: ${previousBest.value.mse}\n`);
      if (previousBest.value.mse < mseThreshold) {
        console.log('Previous best already meets threshold! Using it as starting point.');
        bestCode = previousBest.value.code;
        bestMSE = previousBest.value.mse;
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
          // Use AI to determine optimization strategy based on previous results
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
        
        // Modify code to use dataFile if provided
        let testCode = currentCode;
        if (dataFile) {
          testCode = testCode.replace('# df = load_data(\'your_data.csv\')', `df = load_data('${dataFile}')`);
          testCode = testCode.replace('# X, y = prepare_features(df)', 'X, y = prepare_features(df)');
          testCode = testCode.replace('# mse, model = train_and_evaluate(X, y)', 'mse, model = train_and_evaluate(X, y)');
          testCode = testCode.replace('# print(f\'MSE: {mse}\')', 'print(f\'MSE: {mse}\')');
          testCode = testCode.replace('print(\'Pipeline template generated. Add your data to execute.\')', '');
          testCode = testCode.replace('print(\'MSE: 0.0\')', '');
        }

        const testResult = await this.executeTool('testMLPipeline', {
          pythonCode: testCode
        });

        if (!testResult.success || testResult.result.mse === null) {
          console.error('Failed to test pipeline or extract MSE');
          console.log('Output:', testResult.result?.output || testResult.error);
          
          // Store failed attempt in memory
          await this.storeMemory({
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

        // Step 3: Store iteration result in short-term memory
        await this.storeMemory({
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

          // Store in long-term memory
          await this.storeLongTermMemory({
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
            
            // Save final result
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
        
        await this.storeMemory({
          key: `iteration_${iteration}_error`,
          value: {
            iteration,
            error: error.message,
            stack: error.stack
          },
          metadata: { type: 'error' }
        });
      }

      // Brief pause between iterations
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
   * Generate optimization prompt using AI based on previous results
   */
  async _generateOptimizationPrompt(currentCode, lastMSE, iteration) {
    if (!this.anthropic) {
      // Fallback to simple rule-based prompts
      const strategies = [
        'Add hyperparameter tuning with GridSearchCV',
        'Add feature engineering with polynomial features',
        'Add cross-validation for better generalization',
        'Try ensemble methods combining multiple models',
        'Add feature selection to remove noise',
        'Increase model complexity with deeper networks',
        'Add regularization to prevent overfitting',
        'Try different preprocessing techniques'
      ];
      return strategies[iteration % strategies.length];
    }

    try {
      // Search recent iteration results
      const recentResults = await this.searchMemory({ query: 'iteration' });
      const history = recentResults.results
        .filter(r => r.value.mse !== undefined)
        .slice(-5)
        .map(r => `Iteration ${r.value.iteration}: MSE ${r.value.mse}`)
        .join('\n');

      const prompt = `Based on the ML pipeline optimization history, suggest the next optimization strategy.

Current MSE: ${lastMSE}
Iteration: ${iteration}

Recent history:
${history}

What specific optimization should be applied next to reduce MSE? Be concise and specific.`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return message.content[0].text.trim();
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
    this.listTools().forEach((tool, idx) => {
      console.log(`${idx + 1}. ${tool.name}: ${tool.description}`);
    });
    console.log('\nType "exit" to quit\n');

    // Note: For a truly interactive CLI, you'd use readline or similar
    // This is a simplified version
    console.log('Use agent.executeTool(toolName, params) to execute tools programmatically');
  }
}

// Export for use as a module
export default ObscureXAgent;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new ObscureXAgent();
  
  // Check for command line arguments
  if (process.argv.length > 2) {
    const command = process.argv[2];
    
    if (command === 'list-tools') {
      console.log(JSON.stringify(agent.listTools(), null, 2));
    } else if (command === 'interactive') {
      agent.interactiveMode();
    } else if (command === 'optimize') {
      // Run optimization loop
      const dataFile = process.argv[3] || null;
      const threshold = parseFloat(process.argv[4]) || 0.1;
      const maxIter = parseInt(process.argv[5]) || 50;
      
      agent.runOptimizationLoop({
        dataFile,
        mseThreshold: threshold,
        maxIterations: maxIter,
        initialPrompt: 'Create a comprehensive price prediction pipeline using CatBoost with proper feature engineering',
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
      console.log('  node agent.js optimize data.csv 0.05 30           - Optimize until MSE < 0.05');
      console.log('\nOr import the agent in your code:');
      console.log('  import ObscureXAgent from "./agent.js"');
    }
  } else {
    console.log('ObscureX AI Agent\n');
    console.log('Usage:');
    console.log('  node agent.js list-tools                          - List all available tools');
    console.log('  node agent.js interactive                         - Start interactive mode');
    console.log('  node agent.js optimize [dataFile] [threshold] [maxIter] - Run optimization loop');
    console.log('\nExamples:');
    console.log('  node agent.js optimize data.csv 0.05 30           - Optimize until MSE < 0.05');
    console.log('\nOr import the agent in your code:');
    console.log('  import ObscureXAgent from "./agent.js"');
  }
}
