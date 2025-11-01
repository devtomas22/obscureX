import ObscureXAgent from './agent.js';

/**
 * Example demonstrating the orchestrator and memory features
 */

async function demonstrateMemory() {
  const agent = new ObscureXAgent();
  
  console.log('=== Memory Management Examples ===\n');
  
  // Short-term memory
  console.log('1. Storing in short-term memory:');
  await agent.executeTool('storeMemory', {
    key: 'current_experiment',
    value: { 
      name: 'Price Prediction v1',
      status: 'in_progress',
      startTime: new Date().toISOString()
    },
    metadata: { type: 'experiment' }
  });
  console.log('✓ Stored experiment info\n');
  
  // Retrieve from short-term memory
  console.log('2. Retrieving from short-term memory:');
  const retrieved = await agent.executeTool('retrieveMemory', {
    key: 'current_experiment'
  });
  console.log('Retrieved:', JSON.stringify(retrieved.result, null, 2), '\n');
  
  // Long-term memory
  console.log('3. Storing in long-term memory:');
  await agent.executeTool('storeLongTermMemory', {
    key: 'best_approach',
    value: {
      technique: 'CatBoost with feature engineering',
      performance: 'MSE: 0.05',
      notes: 'Works well with time-series data'
    },
    metadata: { domain: 'price_prediction' }
  });
  console.log('✓ Stored in long-term memory\n');
  
  // Search memory
  console.log('4. Searching memory:');
  const searchResult = await agent.executeTool('searchMemory', {
    query: 'experiment'
  });
  console.log(`Found ${searchResult.result.count} results`);
  console.log('Results:', JSON.stringify(searchResult.result.results, null, 2), '\n');
  
  console.log('Memory files created:');
  console.log('- agent_memory.json (short-term)');
  console.log('- agent_longterm_memory.json (long-term)\n');
}

async function demonstrateOrchestrator() {
  console.log('\n=== Orchestrator Example ===\n');
  console.log('The orchestrator runs optimization loops automatically.');
  console.log('It will:');
  console.log('1. Generate initial ML pipeline');
  console.log('2. Test and measure MSE');
  console.log('3. Store results in memory');
  console.log('4. Generate optimizations using AI');
  console.log('5. Repeat until MSE threshold is met or max iterations reached\n');
  
  console.log('To run the orchestrator:');
  console.log('  node agent.js optimize [dataFile] [threshold] [maxIterations]');
  console.log('\nExample:');
  console.log('  node agent.js optimize sample_data.csv 0.05 10');
  console.log('\nNote: Requires ANTHROPIC_API_KEY environment variable for AI-powered optimization\n');
  
  // Show a mini example without actual API calls
  const agent = new ObscureXAgent();
  
  console.log('Storing initial configuration in memory...');
  await agent.executeTool('storeMemory', {
    key: 'orchestrator_config',
    value: {
      mseThreshold: 0.1,
      maxIterations: 50,
      status: 'configured'
    }
  });
  
  console.log('✓ Configuration stored');
  console.log('\nThe orchestrator will track:');
  console.log('- Each iteration attempt');
  console.log('- MSE improvements');
  console.log('- Best performing pipeline (in long-term memory)');
  console.log('- Failed attempts (for learning)\n');
}

async function demonstrateToolsWithMemory() {
  const agent = new ObscureXAgent();
  
  console.log('\n=== Integrated Tool + Memory Example ===\n');
  
  // Install a module and remember it
  console.log('1. Installing Python module and storing in memory:');
  const installResult = await agent.executeTool('installPythonModule', {
    moduleName: 'numpy'
  });
  
  if (installResult.success) {
    await agent.executeTool('storeLongTermMemory', {
      key: 'installed_numpy',
      value: {
        module: 'numpy',
        installedAt: new Date().toISOString(),
        purpose: 'numerical computations for ML'
      }
    });
    console.log('✓ Module installed and logged in long-term memory\n');
  }
  
  // List modules and store count
  console.log('2. Listing Python modules and storing count:');
  const modulesList = await agent.executeTool('listPythonModules', {});
  if (modulesList.success) {
    await agent.executeTool('storeMemory', {
      key: 'python_modules_count',
      value: {
        count: modulesList.result.length,
        timestamp: new Date().toISOString()
      }
    });
    console.log(`✓ Found ${modulesList.result.length} modules, stored in memory\n`);
  }
  
  // Search long-term memory for installed modules
  console.log('3. Searching long-term memory for installation records:');
  const searchResult = await agent.executeTool('searchLongTermMemory', {
    query: 'installed'
  });
  console.log(`Found ${searchResult.result.count} installation records`);
  if (searchResult.result.count > 0) {
    console.log('Records:', JSON.stringify(searchResult.result.results, null, 2));
  }
  console.log();
}

// Run demonstrations
async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  ObscureX AI Agent - Orchestrator & Memory Demo      ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  try {
    await demonstrateMemory();
    await demonstrateToolsWithMemory();
    await demonstrateOrchestrator();
    
    console.log('=== Demo Complete ===\n');
    console.log('Check the following files:');
    console.log('- agent_memory.json');
    console.log('- agent_longterm_memory.json');
    console.log('\nTo run actual optimization:');
    console.log('1. Set ANTHROPIC_API_KEY environment variable');
    console.log('2. Prepare a CSV data file');
    console.log('3. Run: node agent.js optimize data.csv 0.05 10\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
