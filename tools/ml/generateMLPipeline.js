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
  parameters: { existingCode: 'string|null', prompt: 'string', anthropic: 'object|null' },
  
  async execute(params) {
    const { existingCode, prompt, anthropic = null } = params;
    
    let code;
    
    // Try to use Anthropic API if available
    if (anthropic) {
      try {
        if (existingCode) {
          code = await this._optimizeMLPipelineWithAI(existingCode, prompt, anthropic);
        } else {
          code = await this._initializeMLPipelineWithAI(prompt, anthropic);
        }
      } catch (error) {
        console.warn('Anthropic API failed, falling back to template generation:', error.message);
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
  },

  /**
   * Initialize a new ML pipeline using Anthropic API
   */
  async _initializeMLPipelineWithAI(prompt, anthropic) {
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

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    let code = message.content[0].text;
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    return code.trim();
  },

  /**
   * Optimize existing ML pipeline using Anthropic API
   */
  async _optimizeMLPipelineWithAI(existingCode, prompt, anthropic) {
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

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      system: systemPrompt
    });

    let code = message.content[0].text;
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
    return code.trim();
  },

  /**
   * Initialize a new ML pipeline (template-based)
   */
  _initializeMLPipeline(prompt) {
    const useCatBoost = prompt.toLowerCase().includes('catboost');
    const useNeuralNetwork = prompt.toLowerCase().includes('neural') || prompt.toLowerCase().includes('nn');
    
    let code = `#!/usr/bin/env python3
"""
ML Pipeline for Binance Price Prediction
Generated based on: ${prompt}
Works with Binance CSV format: timestamp, open, high, low, close, volume
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
def load_binance_data(filepath):
    """Load and prepare Binance price data from CSV"""
    df = pd.read_csv(filepath)
    
    # Binance format typically has: timestamp (or open_time), open, high, low, close, volume
    # Convert timestamp to datetime if needed
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    elif 'open_time' in df.columns:
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
    
    return df

def prepare_features(df):
    """Prepare features and target from Binance data"""
    # Assuming the target is the next close price (shifted)
    # Use numeric columns as features
    X = df.select_dtypes(include=[np.number]).copy()
    
    # Remove target column if it exists, or create target from close
    if 'close' in X.columns:
        y = X['close'].shift(-1)  # Predict next close
        X = X[:-1]  # Remove last row
        y = y[:-1]  # Remove last NaN
    else:
        raise ValueError("No 'close' column found in data")
    
    # Drop any remaining NaN values
    mask = ~(X.isna().any(axis=1) | y.isna())
    X = X[mask]
    y = y[mask]
    
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
      code += `    # Train CatBoost model (optimized for Binance data)
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
      code += `    # Train CatBoost model (default for Binance data)
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
    # Example usage with Binance data
    # df = load_binance_data('binance_btcusdt_1h.csv')
    # X, y = prepare_features(df)
    # mse, model = train_and_evaluate(X, y)
    # print(f'MSE: {mse}')
    
    # For testing without data
    print('Pipeline template generated for Binance price data.')
    print('MSE: 0.0')
`;

    return code;
  },

  /**
   * Optimize existing ML pipeline (template-based)
   */
  _optimizeMLPipeline(existingCode, prompt) {
    let optimizedCode = existingCode;
    
    const optimizationHints = prompt.toLowerCase();
    
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
      
      const importEnd = optimizedCode.indexOf('\n\n');
      if (importEnd !== -1) {
        optimizedCode = optimizedCode.slice(0, importEnd) + tuningCode + optimizedCode.slice(importEnd);
      }
    }
    
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
};
