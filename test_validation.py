#!/usr/bin/env python3
"""
Test validation for ObscureX Agent
"""

import asyncio
import os
import sys
from obscurex import ObscureXAgent


async def run_tests():
    """Run validation tests for the agent."""
    print('=== ObscureX Agent Validation Tests (Python) ===\n')
    
    agent = ObscureXAgent()
    passed = 0
    failed = 0
    total = 0
    
    # Test 1: Verify all tools are available
    print('Test 1: Verify all tools are available')
    total += 1
    tools = await agent.list_tools()
    if len(tools) >= 13:  # Should have at least 13 tools
        print(f'✓ PASS: Found {len(tools)} tools (expected at least 13)\n')
        passed += 1
    else:
        print(f'✗ FAIL: Only found {len(tools)} tools\n')
        failed += 1
    
    # Test 2: CSV operations
    print('Test 2: CSV operations (add, list, remove indicators)')
    total += 1
    try:
        # Create test file
        with open('test_data.csv', 'w') as f:
            f.write('date,open,high,low,close,volume\n')
            f.write('2024-01-01,100,105,99,103,1000\n')
        
        # Add indicator
        await agent.execute_tool('addTechnicalIndicator', {
            'filename': 'test_data.csv',
            'indicatorName': 'TEST_IND'
        })
        
        # List indicators
        result = await agent.execute_tool('listTechnicalIndicators', {
            'filename': 'test_data.csv'
        })
        
        if 'TEST_IND' in result['result']:
            print('✓ PASS: Indicator added and listed correctly')
            
            # Remove indicator
            await agent.execute_tool('removeTechnicalIndicator', {
                'filename': 'test_data.csv',
                'indicatorName': 'TEST_IND'
            })
            
            result = await agent.execute_tool('listTechnicalIndicators', {
                'filename': 'test_data.csv'
            })
            
            if 'TEST_IND' not in result['result']:
                print('✓ PASS: Indicator removed correctly\n')
                passed += 1
            else:
                print('✗ FAIL: Indicator not removed\n')
                failed += 1
        else:
            print('✗ FAIL: Indicator not added\n')
            failed += 1
        
        # Cleanup
        if os.path.exists('test_data.csv'):
            os.remove('test_data.csv')
    except Exception as e:
        print(f'✗ FAIL: {e}\n')
        failed += 1
    
    # Test 3: Memory operations
    print('Test 3: Memory operations (store, retrieve, search)')
    total += 1
    try:
        # Store
        await agent.execute_tool('storeMemory', {
            'key': 'test_mem',
            'value': 'test_value',
            'metadata': {}
        })
        
        # Retrieve
        result = await agent.execute_tool('retrieveMemory', {
            'key': 'test_mem'
        })
        
        if result['result']['value'] == 'test_value':
            print('✓ PASS: Short-term memory store/retrieve works')
            
            # Search
            result = await agent.execute_tool('searchMemory', {
                'query': 'test_mem'
            })
            
            if result['result']['count'] > 0:
                print('✓ PASS: Short-term memory search works')
                
                # Long-term memory
                await agent.execute_tool('storeLongTermMemory', {
                    'key': 'test_lt',
                    'value': 'long_term_value',
                    'metadata': {}
                })
                
                result = await agent.execute_tool('retrieveLongTermMemory', {
                    'key': 'test_lt'
                })
                
                if result['result']['value'] == 'long_term_value':
                    print('✓ PASS: Long-term memory works\n')
                    passed += 1
                else:
                    print('✗ FAIL: Long-term memory retrieve failed\n')
                    failed += 1
            else:
                print('✗ FAIL: Memory search failed\n')
                failed += 1
        else:
            print('✗ FAIL: Memory retrieve failed\n')
            failed += 1
    except Exception as e:
        print(f'✗ FAIL: {e}\n')
        failed += 1
    
    # Test 4: Python module operations
    print('Test 4: Python module operations')
    total += 1
    try:
        result = await agent.execute_tool('listPythonModules', {})
        if result['success'] and len(result['result']) > 0:
            print(f'✓ PASS: Listed {len(result["result"])} Python modules\n')
            passed += 1
        else:
            print('✗ FAIL: Failed to list modules\n')
            failed += 1
    except Exception as e:
        print(f'✗ FAIL: {e}\n')
        failed += 1
    
    # Test 5: AI features (skip if no API key)
    print('Test 5: ML Pipeline generation (AI-powered)')
    total += 1
    if not agent.ai_service.is_available():
        print('⚠ SKIP: AI API key not available (test requires Anthropic Claude API)\n')
    else:
        try:
            result = await agent.execute_tool('generateMLPipeline', {
                'existingCode': None,
                'prompt': 'Create a simple linear regression pipeline'
            })
            if result['success']:
                print(f'✓ PASS: Pipeline generated: {result["result"]["filename"]}\n')
                passed += 1
            else:
                print(f'✗ FAIL: {result.get("error")}\n')
                failed += 1
        except Exception as e:
            print(f'✗ FAIL: {e}\n')
            failed += 1
    
    # Summary
    print('=== Test Summary ===')
    print(f'Passed: {passed}')
    print(f'Failed: {failed}')
    print(f'Total: {total}')
    
    if failed > 0:
        print(f'\n⚠ {failed} test(s) failed')
        return 1
    else:
        print('\n✓ All tests passed!')
        return 0


if __name__ == '__main__':
    try:
        exit_code = asyncio.run(run_tests())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print('\nInterrupted by user')
        sys.exit(0)
    except Exception as e:
        print(f'\nError: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
