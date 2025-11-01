import ObscureXAgent from './agent.js';
import { writeFileSync, existsSync, unlinkSync } from 'fs';

/**
 * Validation tests for the ObscureX AI Agent
 */

async function runTests() {
  console.log('=== ObscureX Agent Validation Tests ===\n');
  
  const agent = new ObscureXAgent();
  let passed = 0;
  let failed = 0;

  // Test 1: Tool count
  console.log('Test 1: Verify all 13 tools are available');
  const tools = agent.listTools();
  if (tools.length === 13) {
    console.log('✓ PASS: All 13 tools found\n');
    passed++;
  } else {
    console.log(`✗ FAIL: Expected 13 tools, found ${tools.length}\n`);
    failed++;
  }

  // Test 2: CSV operations
  console.log('Test 2: CSV operations (add, list, remove indicators)');
  const testCSV = 'test_data.csv';
  writeFileSync(testCSV, 'date,open,high,low,close,volume\n2024-01-01,100,105,99,103,1000\n');
  
  try {
    // Add indicator
    await agent.executeTool('addTechnicalIndicator', {
      filename: testCSV,
      indicatorName: 'TEST_SMA'
    });
    
    // List indicators
    const listResult = await agent.executeTool('listTechnicalIndicators', {
      filename: testCSV
    });
    
    if (listResult.result.includes('TEST_SMA')) {
      console.log('✓ PASS: Indicator added and listed correctly');
    } else {
      console.log('✗ FAIL: Indicator not found in list');
      failed++;
    }
    
    // Remove indicator
    await agent.executeTool('removeTechnicalIndicator', {
      filename: testCSV,
      indicatorName: 'TEST_SMA'
    });
    
    const listResult2 = await agent.executeTool('listTechnicalIndicators', {
      filename: testCSV
    });
    
    if (!listResult2.result.includes('TEST_SMA')) {
      console.log('✓ PASS: Indicator removed correctly\n');
      passed++;
    } else {
      console.log('✗ FAIL: Indicator still present after removal\n');
      failed++;
    }
    
    // Cleanup
    if (existsSync(testCSV)) unlinkSync(testCSV);
  } catch (error) {
    console.log(`✗ FAIL: CSV operations error: ${error.message}\n`);
    failed++;
  }

  // Test 3: Memory operations
  console.log('Test 3: Memory operations (store, retrieve, search)');
  try {
    // Store in short-term memory
    await agent.executeTool('storeMemory', {
      key: 'test_key',
      value: { data: 'test_value' },
      metadata: { test: true }
    });
    
    // Retrieve
    const retrieved = await agent.executeTool('retrieveMemory', {
      key: 'test_key'
    });
    
    if (retrieved.success && retrieved.result.value.data === 'test_value') {
      console.log('✓ PASS: Short-term memory store/retrieve works');
    } else {
      console.log('✗ FAIL: Short-term memory retrieve failed');
      failed++;
    }
    
    // Search
    const searchResult = await agent.executeTool('searchMemory', {
      query: 'test_key'
    });
    
    if (searchResult.result.count > 0) {
      console.log('✓ PASS: Short-term memory search works');
      passed++;
    } else {
      console.log('✗ FAIL: Short-term memory search failed');
      failed++;
    }
    
    // Long-term memory
    await agent.executeTool('storeLongTermMemory', {
      key: 'lt_test',
      value: { persistent: true }
    });
    
    const ltRetrieved = await agent.executeTool('retrieveLongTermMemory', {
      key: 'lt_test'
    });
    
    if (ltRetrieved.success) {
      console.log('✓ PASS: Long-term memory works\n');
      passed++;
    } else {
      console.log('✗ FAIL: Long-term memory failed\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: Memory operations error: ${error.message}\n`);
    failed++;
  }

  // Test 4: Python module listing
  console.log('Test 4: Python module operations');
  try {
    const modules = await agent.executeTool('listPythonModules', {});
    
    if (modules.success && modules.result.length > 0) {
      console.log(`✓ PASS: Listed ${modules.result.length} Python modules\n`);
      passed++;
    } else {
      console.log('✗ FAIL: No Python modules found\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: Python module listing error: ${error.message}\n`);
    failed++;
  }

  // Test 5: Pipeline generation (template-based, no API key needed)
  console.log('Test 5: ML Pipeline generation (template-based)');
  try {
    const generated = await agent.executeTool('generateMLPipeline', {
      existingCode: null,
      prompt: 'Create a test pipeline using CatBoost'
    });
    
    if (generated.success && generated.result.code.includes('CatBoost')) {
      console.log('✓ PASS: Pipeline generation works');
      console.log(`  Generated file: ${generated.result.filename}\n`);
      passed++;
      
      // Cleanup generated file
      if (existsSync(generated.result.filename)) {
        unlinkSync(generated.result.filename);
      }
    } else {
      console.log('✗ FAIL: Pipeline generation failed\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: Pipeline generation error: ${error.message}\n`);
    failed++;
  }

  // Test 6: ML Pipeline testing
  console.log('Test 6: ML Pipeline testing');
  const simplePipeline = `
import numpy as np
from sklearn.metrics import mean_squared_error

y_true = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y_pred = np.array([1.1, 2.1, 3.1, 4.1, 5.1])

mse = mean_squared_error(y_true, y_pred)
print(f'MSE: {mse}')
`;
  
  try {
    const testResult = await agent.executeTool('testMLPipeline', {
      pythonCode: simplePipeline
    });
    
    if (testResult.result.success && testResult.result.mse !== null) {
      console.log(`✓ PASS: Pipeline testing works (MSE: ${testResult.result.mse})\n`);
      passed++;
    } else {
      console.log('✗ FAIL: Pipeline testing failed or MSE not extracted\n');
      failed++;
    }
  } catch (error) {
    console.log(`✗ FAIL: Pipeline testing error: ${error.message}\n`);
    failed++;
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n✓✓✓ All tests passed! ✓✓✓');
  } else {
    console.log(`\n⚠ ${failed} test(s) failed`);
  }
  
  return failed === 0;
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
