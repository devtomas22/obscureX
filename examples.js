import ObscureXAgent from './agent.js';

/**
 * Example usage of ObscureX AI Agent
 */

async function runExamples() {
  const agent = new ObscureXAgent();
  
  console.log('=== ObscureX AI Agent Examples ===\n');
  
  // Example 1: List all available tools
  console.log('Example 1: List all available tools');
  console.log('-----------------------------------');
  const tools = await agent.listTools();
  tools.forEach(tool => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });
  console.log();
  
  // Example 2: Create a sample CSV file
  console.log('Example 2: Create sample CSV file with OHLCV data');
  console.log('--------------------------------------------------');
  const fs = await import('fs');
  const sampleCSV = `date,open,high,low,close,volume
2024-01-01,100,105,99,103,1000
2024-01-02,103,108,102,107,1200
2024-01-03,107,110,106,109,1100
2024-01-04,109,112,108,111,1300
2024-01-05,111,115,110,114,1400`;
  
  fs.writeFileSync('sample_data.csv', sampleCSV);
  console.log('Created sample_data.csv\n');
  
  // Example 3: List technical indicators (should be empty initially)
  console.log('Example 3: List technical indicators from CSV');
  console.log('----------------------------------------------');
  let result = await agent.executeTool('listTechnicalIndicators', { 
    filename: 'sample_data.csv' 
  });
  console.log('Indicators:', JSON.stringify(result.result, null, 2));
  console.log();
  
  // Example 4: Add technical indicators
  console.log('Example 4: Add technical indicators to CSV');
  console.log('------------------------------------------');
  result = await agent.executeTool('addTechnicalIndicator', { 
    filename: 'sample_data.csv',
    indicatorName: 'SMA_20'
  });
  console.log(result.result.message);
  
  result = await agent.executeTool('addTechnicalIndicator', { 
    filename: 'sample_data.csv',
    indicatorName: 'RSI_14'
  });
  console.log(result.result.message);
  
  result = await agent.executeTool('addTechnicalIndicator', { 
    filename: 'sample_data.csv',
    indicatorName: 'MACD'
  });
  console.log(result.result.message);
  console.log();
  
  // Example 5: List technical indicators again
  console.log('Example 5: List technical indicators after adding');
  console.log('-------------------------------------------------');
  result = await agent.executeTool('listTechnicalIndicators', { 
    filename: 'sample_data.csv' 
  });
  console.log('Indicators:', result.result);
  console.log();
  
  // Example 6: Remove a technical indicator
  console.log('Example 6: Remove a technical indicator');
  console.log('---------------------------------------');
  result = await agent.executeTool('removeTechnicalIndicator', { 
    filename: 'sample_data.csv',
    indicatorName: 'MACD'
  });
  console.log(result.result.message);
  
  result = await agent.executeTool('listTechnicalIndicators', { 
    filename: 'sample_data.csv' 
  });
  console.log('Remaining indicators:', result.result);
  console.log();
  
  // Example 7: List Python modules
  console.log('Example 7: List installed Python modules');
  console.log('----------------------------------------');
  result = await agent.executeTool('listPythonModules', {});
  console.log(`Found ${result.result.length} Python modules`);
  console.log('First 10 modules:', result.result.slice(0, 10));
  console.log();
  
  // Example 8: Generate ML pipeline
  console.log('Example 8: Generate ML pipeline with CatBoost');
  console.log('---------------------------------------------');
  result = await agent.executeTool('generateMLPipeline', { 
    existingCode: null,
    prompt: 'Create a price prediction pipeline using CatBoost'
  });
  console.log(result.result.message);
  console.log('Generated file:', result.result.filename);
  console.log();
  
  // Example 9: Generate ML pipeline with Neural Network
  console.log('Example 9: Generate ML pipeline with Neural Network');
  console.log('---------------------------------------------------');
  result = await agent.executeTool('generateMLPipeline', { 
    existingCode: null,
    prompt: 'Create a price prediction pipeline using neural network'
  });
  console.log(result.result.message);
  console.log('Generated file:', result.result.filename);
  console.log();
  
  // Example 10: Test ML pipeline
  console.log('Example 10: Test a simple ML pipeline');
  console.log('-------------------------------------');
  const simplePipeline = `
import numpy as np
from sklearn.metrics import mean_squared_error

# Generate sample data
y_true = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y_pred = np.array([1.1, 2.2, 2.9, 4.1, 5.2])

# Calculate MSE
mse = mean_squared_error(y_true, y_pred)
print(f'MSE: {mse}')
`;
  
  result = await agent.executeTool('testMLPipeline', { 
    pythonCode: simplePipeline
  });
  console.log('Test result:', result.result.message);
  if (result.result.mse !== null) {
    console.log('MSE value:', result.result.mse);
  }
  console.log();
  
  console.log('=== Examples completed ===');
}

// Run examples
runExamples().catch(console.error);
